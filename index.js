import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Dexie from 'dexie';
import 'dexie-observable';
import { nanoid } from 'nanoid';
import isEqual from 'lodash.isequal';

const emptyObj = {};
let db;
let monitor = false;

class TransactionMonitor {
  constructor() {
    this.active = new Map();
    this.fulfilled = new Map();
    this.maxActive = 0;
    this.elapsed = [];
  }

  getStats() {
    const active = this.active.size;
    const fulfilled = this.fulfilled.size;
    const avg = (this.elapsed.reduce((acc, val) => acc + val, 0) / this.elapsed.length).toFixed(2);
    const avgLast10 = (
      this.elapsed.slice(0, 10).reduce((acc, val) => acc + val, 0) / this.elapsed.length
    ).toFixed(2);

    return {
      maxActive: this.maxActive,
      active,
      fulfilled,
      avg,
      avgLast10,
    };
  }

  start() {
    const id = nanoid();
    const startTime = Date.now();
    this.active.set(id, { id, startTime, open: true });

    const active = this.active.size;
    if (active > this.maxActive) this.maxActive = active;

    return id;
  }

  end(id) {
    const tx = this.active.get(id);
    const elapsed = Date.now() - tx.startTime;

    this.elapsed.push(elapsed);
    this.active.delete(id);
    this.fulfilled.set(id, { id, elapsed, open: false });
  }
}
class DBDispatcher {
  constructor() {
    this.subscribers = new Map();
    this.subscriptions = new Map();
    this.engaged = false;
  }

  getStats() {
    const subscribers = this.subscribers.size;
    const subscriptions = this.subscriptions.size;

    return {
      subscriptions,
      tables: [...this.subscriptions.keys()],
      subscribers,
    };
  }

  dispatchChanges(changes) {
    const changedTables = new Set(changes.map((change) => change.table));
    for (const key of changedTables) {
      (this.subscriptions.get(key) || []).forEach((subscriber) => {
        subscriber.cb(key);
      });
    }
  }
  subscribe(subscriberId, key, cb) {
    if (!this.engaged) {
      this.engaged = true;
      db.on('changes', (changes) => this.dispatchChanges(changes));
    }

    if (!this.subscribers.has(subscriberId)) {
      this.subscribers.set(subscriberId, key);
      this.subscriptions.set(key, [
        ...(this.subscriptions.get(key) || []),
        { id: subscriberId, cb },
      ]);
    }
  }

  unsubscribe(subscriberId) {
    const key = this.subscribers.get(subscriberId);
    if (key) {
      const subscriptions = this.subscriptions.get(key).filter((s) => s.id !== subscriberId);

      if (subscriptions.length === 0) this.subscriptions.delete(key);
      else this.subscriptions.set(key, subscriptions);
    }

    this.subscribers.delete(subscriberId);
  }
}

const dbDispatcher = new DBDispatcher();
const trxMonitor = new TransactionMonitor();

function executeTransaction(key, query, cb, cbError) {
  let txId = monitor ? trxMonitor.start() : null;

  db.transaction('rw!', db.table(key), (tx) => {
    return query(tx.table(key));
  })
    .then((data) => {
      if (txId) trxMonitor.end(txId);
      return cb(data);
    })
    .catch((error) => {
      if (txId) trxMonitor.end(txId);
      if (cbError) cbError(error);
      else throw new Error(`useDexie: Transaction ${key}: ${error}`);
    });
}

function transaction(key, query, cb, cbError) {
  if (db.isOpen()) executeTransaction(key, query, cb, cbError);
  else {
    db.open().then(() => executeTransaction(key, query, cb, cbError));
  }
}

function composeWhere(query, where, join, forceWhere) {
  for (const { field, operator, value = '', param, filter, or, and } of where) {
    const joiner = !join || forceWhere ? 'where' : join;

    const Value = (() => {
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'boolean') return value;
      if (!isNaN(value)) return Number(value);

      const multiple = value.split(',');
      if (multiple.length === 1) return `"${value}"`;
      else {
        const values = multiple.map((m) => {
          if (typeof value === 'boolean') return value;
          if (!isNaN(value)) return Number(value);
          return `"${value}"`;
        });

        return values.join(',');
      }
    })();

    let missingWhere = joiner === 'where' && !field;

    if (!missingWhere) {
      forceWhere = false;

      if (['or', 'where'].includes(joiner)) {
        //console.log(`query.${joiner}('${field}').${operator}(${Value})`);
        query = new Function('query', `return query.${joiner}('${field}').${operator}(${Value})`)(
          query
        );
      } else {
        //console.log(`query.and(${filter.toString()})`, param);
        query = new Function('query,param', `return query.and(${filter.toString()})`)(query, param);
      }
    }

    if (or) query = composeWhere(query, or, 'or', missingWhere);
    if (and) query = composeWhere(query, and, 'and', missingWhere);
  }

  return query;
}

function composeQuery(dbTable, query = emptyObj) {
  const {
    where,
    orderBy,
    reverse,
    offset,
    limit,
    filter,
    count,
    primaryKeys,
    erase,
    toArray = true,
  } = query;

  const canOrderBy = orderBy
    ? dbTable.schema.indexes.findIndex((i) => i.keyPath === orderBy) > -1 && !where
    : false;

  if (where !== undefined && where.length > 0) dbTable = composeWhere(dbTable, where);
  if (canOrderBy) dbTable = dbTable.orderBy(orderBy);
  if (filter !== undefined) dbTable = dbTable.filter(filter);
  if (reverse !== undefined) dbTable = dbTable.reverse();
  if (offset !== undefined) dbTable = dbTable.offset(offset);
  if (limit !== undefined) dbTable = dbTable.limit(limit);
  if (count === true) dbTable = dbTable.count();
  if (toArray && !count && !primaryKeys && !erase) dbTable = dbTable.toArray();
  if (primaryKeys) dbTable = dbTable.primaryKeys();
  if (erase === true) dbTable = dbTable.delete();

  return dbTable;
}

function useSubscribeToDBChanges(key, cb) {
  const callerIdRef = useRef(nanoid());

  const subscribe = useCallback((key, cb) => {
    if (key) dbDispatcher.subscribe(callerIdRef.current, key, cb);
  }, []);

  useEffect(() => {
    if (key) dbDispatcher.subscribe(callerIdRef.current, key, cb);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => dbDispatcher.unsubscribe(callerIdRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return subscribe;
}

function useExecuteQuery(key, options) {
  const [rawData, setRawData] = useState();
  const dataRef = useRef();
  const optionsRef = useRef();
  const subscribeToChanges = useSubscribeToDBChanges();

  const execute = useCallback(() => {
    if (optionsRef.current === null) return;
    transaction(
      key,
      (dbTable) => composeQuery(dbTable, optionsRef.current),
      (data) => {
        if (!isEqual(dataRef.current, data)) {
          dataRef.current = data;
          setRawData(data);
        }
      }
    );
  }, [key]);

  useEffect(() => {
    if (!isEqual(optionsRef.current, options)) {
      optionsRef.current = options;
      execute();
    }
  }, [execute, options]);

  useEffect(() => {
    subscribeToChanges(key, () => execute());
  }, [execute, key, subscribeToChanges]);

  return rawData;
}

const toObj = (idField = 'id') => (data) =>
  data.reduce((rv, x) => {
    rv[x[idField]] = x;
    return rv;
  }, {});

const toMap = (idField = 'id') => (data) =>
  data.reduce((rv, x) => {
    rv.set(x[idField], x);
    return rv;
  }, new Map());

const toSet = (idField = 'id') => (data) =>
  data.reduce((rv, x) => {
    rv.add(x[idField]);
    return rv;
  }, new Set());

function useDataType(TypeFunc, Table, params) {
  let options = emptyObj;
  let idField = 'id';
  let cb;

  params.forEach((param) => {
    if (typeof param === 'object') options = param;
    else if (typeof param === 'string') idField = param;
    else if (typeof param === 'function') cb = param;
  });

  const data = useDexieTable(Table, options, TypeFunc(idField));

  return cb && data ? cb(data) : data;
}

export function useDexie(name, ...params) {
  const [database, setDatabase] = useState();

  useEffect(() => {
    if (database) return;

    let version = 1;
    let schema;
    let cb;

    for (const param of params) {
      if (typeof param === 'object') schema = param;
      else if (typeof param === 'number') version = param;
      else if (typeof param === 'function') cb = param;
    }

    // Populate default DB
    db = new Dexie(name);

    if (typeof schema === 'object') {
      db.version(version).stores(schema);
    }

    setDatabase(db);

    cb && cb(db);

    return () => db && db.close();
  }, []);

  return database;
}

export const useDexieMonitor = (freq) => {
  const [data, setData] = useState({});

  useEffect(() => {
    if (!freq) return null;

    monitor = true;

    const interval = setInterval(() => {
      const dispatch = dbDispatcher.getStats();
      const tx = trxMonitor.getStats();

      setData({ ...dispatch, ...tx });
    }, freq);

    return () => clearInterval(interval);
  }, [freq]);

  return data;
};

export const useDexieTable = (Table, ...params) => {
  const options = useMemo(() => (typeof params[0] === 'object' ? params[0] : emptyObj), [params]);
  const cb = useMemo(() => (typeof params[0] === 'object' ? params[1] : params[0]), [params]);
  const data = useExecuteQuery(Table, options);

  if (!data) return;
  return cb ? cb(data) : data;
};

export const useDexieObj = (t, ...p) => useDataType(toObj, t, p);
export const useDexieMap = (t, ...p) => useDataType(toMap, t, p);
export const useDexieSet = (t, ...p) => useDataType(toSet, t, p);

export function useDexieGetTable(Table, opts) {
  const [key, setKey] = useState(Table);
  const [options, setOptions] = useState(opts);
  const cbRef = useRef();
  const data = useExecuteQuery(key, options);

  const func = useCallback(
    (...params) => {
      let id, opts, cb;
      params.forEach((param) => {
        if (typeof param === 'string') id = param;
        else if (typeof param === 'object') opts = param;
        else if (typeof param === 'function') cb = param;
      });

      cbRef.current = cb;

      if ((id && !isEqual(id, key)) || (opts && !isEqual(opts, options))) {
        if (id) setKey(id);
        if (opts) setOptions(opts);

        return;
      }

      if (data && cb) return cb(data);
      return data;
    },
    [key, options, data]
  );

  useEffect(() => {
    if (data && cbRef.current) {
      cbRef.current(data);
      cbRef.current = undefined;
    }
  }, [data]);

  return func;
}

export function useDexieGetItem(Table, itemID, idField = 'id') {
  const idMap = useRef(new Set(itemID ? [itemID] : []));
  const [valuesMap, setValuesMap] = useState(new Map());

  const fetchValues = useCallback(
    async (cb) => {
      transaction(
        Table,
        (table) =>
          table
            .where(idField)
            .anyOf([...idMap.current])
            .toArray(),
        (data) => {
          const newValuesMap = new Map(data.map((item) => [item[idField], item]));
          cb && cb(newValuesMap);
          setValuesMap(newValuesMap);
        }
      );
    },
    [idField, Table]
  );

  useSubscribeToDBChanges(Table, () => fetchValues());

  const getItem = useCallback(
    (id, cb) => {
      if (!idMap.current.has(id)) {
        idMap.current.add(id);
        fetchValues((values) => {
          if (cb) return cb(values.get(id));
        });
      } else {
        if (cb) return cb(valuesMap.get(id));
        return valuesMap.get(id);
      }
    },
    [fetchValues, valuesMap]
  );

  useEffect(() => {
    if (itemID && !idMap.current.has(itemID)) idMap.current.add(itemID);
    if (idMap.current.size > 0) fetchValues();
  }, [fetchValues, itemID]);

  return itemID !== undefined ? valuesMap.get(itemID) : getItem;
}

export function useDexieGetItemKey(Table) {
  const getKeys = useDexieGetTable(Table);

  const cb = useCallback(
    (query, cb) => {
      getKeys({ ...query, primaryKeys: true, limit: 1 }, (keys) => {
        cb && cb(keys[0]);
      });
    },
    [getKeys]
  );

  return cb;
}

export function useDexieDeleteItem(Table) {
  const cb = useCallback(
    (key, cb) => {
      transaction(
        Table,
        (dbTable) => dbTable.delete(key),
        (data) => cb && cb(data)
      );
    },
    [Table]
  );

  return cb;
}

export function useDexieDeleteByQuery(Table) {
  const cb = useCallback(
    (query, cb) => {
      transaction(
        Table,
        (dbTable) => composeQuery(dbTable, { ...query, erase: true }),
        (data) => cb && cb(data)
      );
    },
    [Table]
  );

  return cb;
}

export function useDexiePutItem(Table) {
  const cb = useCallback(
    (item, cb) => {
      transaction(
        Table,
        (dbTable) => dbTable.put(item),
        (data) => cb && cb(data)
      );
    },
    [Table]
  );

  return cb;
}

export function useDexiePutItems(Table) {
  const cb = useCallback(
    (items, cb) => {
      transaction(
        Table,
        (dbTable) => dbTable.bulkPut(items),
        (data) => cb && cb(data)
      );
    },
    [Table]
  );

  return cb;
}

export function useDexieUpdateItem(Table) {
  const getKey = useDexieGetItemKey(Table);
  const getData = useDexieGetTable(Table);

  const cb = useCallback(
    (query, cbOrItem) => {
      getKey(query, (key) => {
        getData({ ...query, limit: 1 }, (data) => {
          const item = data[0];
          if (!item) return;
          const newItem = typeof cbOrItem === 'function' ? cbOrItem(item) : cbOrItem;

          transaction(
            Table,
            (dbTable) => {
              dbTable.put(newItem, key);

              return dbTable;
            },
            (data) => {
              return data;
            }
          );
        });
      });
    },
    [Table, getData, getKey]
  );

  return cb;
}

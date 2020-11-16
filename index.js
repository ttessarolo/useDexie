import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Dexie from 'dexie';
import 'dexie-observable';
import { nanoid } from 'nanoid';
import isEqual from 'lodash.isequal';

let db;

class DBDispatcher {
  constructor() {
    this.subscribers = new Map();
    this.subscriptions = new Map();
    this.engaged = false;
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
      this.subscriptions.set(key, subscriptions);
    }

    this.subscribers.delete(subscriberId);
  }
}

const dbDispatcher = new DBDispatcher();

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

function useDBTransaction(key, modes) {
  const keyRef = useRef(key);
  const modesRef = useRef(modes);
  const txRef = useRef(false);

  const transact = useCallback((query, cb, cbError) => {
    const key = keyRef.current;

    if (!key || txRef.current.active) return;

    db.transaction(modesRef.current || 'r', db[key], (tx) => {
      txRef.current = tx;
      return query(tx.table(key));
    })
      .then((data) => cb(data))
      .catch((error) => {
        console.log('useDexie: transaction error', key, error);
        cbError && cbError(error);
      });
  }, []);

  const isFetching = useCallback(() => txRef.current.active, []);

  useEffect(() => {
    if (key !== keyRef.current) keyRef.current = key;

    return () => {
      if (Dexie.currentTransaction) Dexie.currentTransaction.abort();
    };
  }, [key]);

  return [transact, isFetching];
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
        query = new Function('query', `return query.and(${filter.toString()})`)(query);
      }
    }

    if (or) query = composeWhere(query, or, 'or', missingWhere);
    if (and) query = composeWhere(query, and, 'and', missingWhere);
  }

  return query;
}

function useComposeQuery() {
  const cb = useCallback((dbTable, query = {}) => {
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
      ? dbTable.schema.indexes.findIndex((i) => i.keyPath === orderBy) > -1 && !filter && !where
      : false;

    if (where !== undefined && where.length > 0) dbTable = composeWhere(dbTable, where);
    if (filter !== undefined) dbTable = dbTable.filter(filter);
    if (canOrderBy) dbTable = dbTable.orderBy(orderBy);
    if (reverse !== undefined) dbTable = dbTable.reverse();
    if (offset !== undefined) dbTable = dbTable.offset(offset);
    if (limit !== undefined) dbTable = dbTable.limit(limit);
    if (count === true) dbTable = dbTable.count();
    if (toArray && !count && !primaryKeys && !erase) dbTable = dbTable.toArray();
    if (primaryKeys) dbTable = dbTable.primaryKeys();
    if (erase === true) dbTable = dbTable.delete();

    return dbTable;
  }, []);

  return cb;
}

function useExecuteQuery(key, options) {
  const [rawData, setRawData] = useState();
  const dataRef = useRef();
  const optionsRef = useRef();
  const composeQuery = useComposeQuery();
  const [transact, isFetching] = useDBTransaction(key);
  const subscribeToChanges = useSubscribeToDBChanges();

  const execute = useCallback(() => {
    if (optionsRef.current === null) return;

    transact(
      (dbTable) => composeQuery(dbTable, optionsRef.current),
      (data) => {
        if (!isEqual(dataRef.current, data)) {
          dataRef.current = data;
          setRawData(data);
        }
      }
    );
  }, [composeQuery, transact]);

  useEffect(() => {
    if (!isEqual(optionsRef.current, options)) {
      optionsRef.current = options;
      execute();
    }
  }, [execute, options]);

  useEffect(() => {
    subscribeToChanges(key, () => execute());
  }, [execute, key, subscribeToChanges]);

  return [rawData, isFetching];
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
  let options = {};
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

export const useDexieTable = (Table, ...params) => {
  const options = useMemo(() => (typeof params[0] === 'object' ? params[0] : {}), [params]);
  const cb = useMemo(() => (typeof params[0] === 'object' ? params[1] : params[0]), [params]);
  const [data] = useExecuteQuery(Table, options);

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
  const [data, isFetching] = useExecuteQuery(key, options);

  const func = useCallback(
    (...params) => {
      if (isFetching()) return;

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
    [key, options, data, isFetching]
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
  const [transact] = useDBTransaction(Table);

  const fetchValues = useCallback(
    async (cb) => {
      transact(
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
    [idField, transact]
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
  const [transact] = useDBTransaction(Table, 'rw');

  const cb = useCallback(
    (key, cb) => {
      transact(
        (dbTable) => dbTable.delete(key),
        (data) => cb && cb(data)
      );
    },
    [transact]
  );

  return cb;
}

export function useDexieDeleteByQuery(Table) {
  const [transact] = useDBTransaction(Table, 'rw');
  const composeQuery = useComposeQuery();

  const cb = useCallback(
    (query, cb) => {
      transact(
        (dbTable) => composeQuery(dbTable, { ...query, erase: true }),
        (data) => cb && cb(data)
      );
    },
    [composeQuery, transact]
  );

  return cb;
}

export function useDexiePutItem(Table) {
  const [transact] = useDBTransaction(Table, 'rw');

  const cb = useCallback(
    (item, cb) => {
      transact(
        (dbTable) => dbTable.put(item),
        (data) => cb && cb(data)
      );
    },
    [transact]
  );

  return cb;
}

export function useDexieUpdateItem(Table) {
  const getKey = useDexieGetItemKey(Table);
  const getData = useDexieGetTable(Table);
  const [transact] = useDBTransaction(Table, 'rw');

  const cb = useCallback(
    (query, cbOrItem) => {
      getKey(query, (key) => {
        getData({ ...query, limit: 1 }, (data) => {
          const item = data[0];
          if (!item) return;
          const newItem = typeof cbOrItem === 'function' ? cbOrItem(item) : cbOrItem;

          transact(
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
    [Table, getData, getKey, transact]
  );

  return cb;
}

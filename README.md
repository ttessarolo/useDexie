![useDexie](https://github.com/ttessarolo/useDexie/blob/main/images/logo.png?raw=true)

<center><h2>React Hooks to use Dexie.js IndexDB library</h2></center>

![NPM](https://img.shields.io/npm/v/use-dexie/latest)
![NPM](https://img.shields.io/npm/dw/use-dexie)
![NPM](https://img.shields.io/npm/l/use-dexie)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/use-dexie)

Dexie.js is a gorgeous library to use **IndexDB** with simple and powerful syntax. However, if you want to use Dexie.js within a **React** project you need to implement a series of logics that allow asynchronous interaction. For this purpose, useDexie is a library that includes a series of **React Hooks** that allow you to easily use IndexDB as a data source for React applications. In many cases **useDexie** allows you to completely replace status libraries such as Redux while ensuring a higher execution speed (data can be pre-loaded) and, of course, **persistency**.

The use-dexie hooks have been optimized to ensure:

- 🔥 Realtime Refresh of React elements that depend on a data source
- ♻️ Minimizing the number of refreshes to bare minimum
- ⚡️ Maximum Speed and Minimum memory footprint
- 🔦 Dynamic Query Composition
- 🕵🏻‍♂️ Performance and Stats Live monitoring

<h1>Index of Content</h1>

<!-- TOC -->

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Hooks](#hooks)
  - [useDexie](#usedexie)
    - [Params](#params)
    - [Example DB Initialize and Populate](#example-db-initialize-and-populate)
  - [useDexieTable](#usedexietable)
    - [Params](#params)
    - [Example Fetch entire Table](#example-fetch-entire-table)
    - [Example Query Table](#example-query-table)
    - [Example Fetch Table with selector Callback](#example-fetch-table-with-selector-callback)
  - [useDexieGetTable](#usedexiegettable)
    - [Params](#params)
    - [Callback Example](#callback-example)
  - [useDexieObj](#usedexieobj)
    - [Example](#example)
  - [useDexieMap](#usedexiemap)
    - [Example](#example)
  - [useDexieSet](#usedexieset)
    - [Example](#example)
  - [useDexieGetItem](#usedexiegetitem)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example: Direct](#example-direct)
    - [Example: Callback](#example-callback)
  - [useDexieGetItemKey](#usedexiegetitemkey)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example](#example)
  - [useDexiePutItem](#usedexieputitem)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example](#example)
  - [useDexiePutItems](#usedexieputitems)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example](#example)
  - [useDexieUpdateItem](#usedexieupdateitem)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example](#example)
  - [useDexieDeleteItem](#usedexiedeleteitem)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example](#example)
  - [useDexieDeleteByQuery](#usedexiedeletebyquery)
    - [Params](#params)
    - [Callback Params](#callback-params)
    - [Example](#example)
  - [useDexieMonitor](#usedexiemonitor)
    - [Example](#example)
- [Query Syntax](#query-syntax)
  - [Where Clause](#where-clause)
    - [Or Clause](#or-clause)
    - [And Clause](#and-clause)
  - [Filtering](#filtering)
  - [Order By](#order-by)
  - [Pagination](#pagination)
  - [Count Results](#count-results)
- [Example: To-Do-List with Create React App](#example-to-do-list-with-create-react-app)

<!-- /TOC -->

# Installation

<a id="markdown-installation" name="installation"></a>

```javascript
npm install use-dexie
```

# Basic Usage

<a id="markdown-basic-usage" name="basic-usage"></a>

Below is a simple example that shows how to instantiate useDexie, populate a simple database of Tasks and then query the database to receive the list of tasks and render them in the component. For a more detailed example see [Example: To-Do-List Create React App](#example-to-do-list-create-react-app).

```javascript
import React from 'react';
import { useDexie, useDexieTable } from 'use-dexie';

function App() {
  useDexie('TASKS_DB', { tasks: 'id, name, done' }, (db) => {
    db.tasks.bulkPut([
      { id: 'T1', label: 'Learn useDexie', done: 'false' },
      { id: 'T2', label: 'Advanced useDexie', done: 'false' },
    ]);
  });

  const tasks = useDexieTable('tasks') || [];

  return (
    <div>
      {tasks.map((task) => (
        <span>task.label</span>
      ))}
    </div>
  );
}
```

# Hooks

<a id="markdown-hooks" name="hooks"></a>

use-dexie offers a set of hooks to read, write and delete data from a single instance of IndexDB (it is not possible to use use-dexie on multiple databases at the same time. Solution: divide the data into several tables within the same DB). The first and most important hook to use is useDexie to initialize the database to be used.

## useDexie

<a id="markdown-usedexie" name="usedexie"></a>

```javascript
Object: db = useDexie(String: dbName, Object: [dbSchema], Number: dbVersion, function: [callback]);
```

useDexie is the main hook that should be invoked mandatorily as soon as possible inside your app to instantiate the DB you want to use. To instantiate the DB you need to provide the name, version and schema. The advice is to use useDexie in the root file of your React application to make the DB immediately available to all your components.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                                                                                                                                                                                                                                               | Example                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| dbName    | The name of DB (Mandatory)                                                                                                                                                                                                                                | "TASKS-DB"                    |
| dbSchema  | The schema to create DB. I must follow the [Dexie.js syntax](<https://dexie.org/docs/Version/Version.stores()>)                                                                                                                                           | `{ tasks: 'id, name, done' }` |
| dbVersion | The version number of DB.Please note that if you want to change an already deployed DB you must change DB version (please check [Dexie.js Documentation](https://dexie.org/docs/Tutorial/Design#database-versioning))                                     | 1                             |
| callback  | useDexie returns the DB asynchronously as soon as it is instantiated. However, if you want to receive the DB synchronously so that you can update it, for example, you can specify a callback that will be called with the DB as soon as it is available. | See example below             |

### Example DB Initialize and Populate

<a id="markdown-example-db-initialize-and-populate" name="example-db-initialize-and-populate"></a>

```javascript
useDexie('TASKS_DB', { tasks: 'id, name, done' }, (db) => {
  db.tasks.bulkPut([
    { id: 'T1', label: 'Learn useDexie', done: 'false' },
    { id: 'T2', label: 'Advanced useDexie', done: 'false' },
  ]);
});
```

## useDexieTable

<a id="markdown-usedexietable" name="usedexietable"></a>

```javascript
Array: results = useDexieTable((String: tableName), (Object: [query]), (Function: [callback]));
```

useDexieTable is a hook to read data contained in a database table. It can be used in several ways:

- to receive all entries of a table
- to receive only one set of results depending on a [query](#query-syntax)
- as a selector to select and process table content

useDexieTable can be used asynchronously by returning the result when available, or a callback can be provided to process the result inline.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                                                                                                                                                                                                     | Example                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| tableName | The name of the table to operate on                                                                                                                                                                             | "tasks"                                                         |
| query     | Optional parameter to fetch data using useDexie [Query Syntax] (#query-syntax)                                                                                                                                  | { where:[{ field: 'done', operator: 'equals', value: 'true' }]} |
| callback  | On optional callback to retrieve and process query/table results. Da notare che il risultato della callback viene restituito dalla funzione useDexieTable dando la possibilità di utilizzarla come un selector. | (results) => doSomething(results)                               |

### Example Fetch entire Table

<a id="markdown-example-fetch-entire-table" name="example-fetch-entire-table"></a>

```javascript
const task = useDexieTable('tasks');
```

### Example Query Table

<a id="markdown-example-query-table" name="example-query-table"></a>

```javascript
const task = useDexieTable('tasks', {
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
});
```

Optimized version using useMemo:

```javascript
//⚠️ Wrapping WhereClause in useMemo reduce updates

const task = useDexieTable(
  'tasks',
  useMemo(() => ({ where: [{ field: 'done', operator: 'equals', value: 'true' }] }), [])
);
```

### Example Fetch Table with selector Callback

<a id="markdown-example-fetch-table-with-selector-callback" name="example-fetch-table-with-selector-callback"></a>

```javascript
const taskDone = useDexieTable('tasks', {
  where: [
    { field: 'done', operator: 'equals', value: 'true' },
    (results) => {
      return results.map((result) => {
        result.lastFetched = new Date();
        return result;
      });
    },
  ],
});
```

Optimized version using useMemo and useCallback:

```javascript
//⚠️ Wrapping WhereClause in useMemo and Callback in useCallback reduce updates
const taskDone = useDexieTable('tasks', useMemo(() => ({ where: [{ field: 'done', operator: 'equals', value: 'true' }] }), []),
    useCallback((results) => {
      return results.map((result) => {
        result.lastFetched = new Date();
        return result;
      });
    },[]),
  ],
});
```

_*⚠️ Consider it a good (and suggested) practice to use useMemo to wrap WhereClause objects and useCallback for callbacks to optimize performance and reduce React updates.*_

## useDexieGetTable

<a id="markdown-usedexiegettable" name="usedexiegettable"></a>

```javascript
Function: getFunc = useDexieGetTable((String: [tableName]), (Object: [query]));
```

useDexieGetTable is a hook that returns a function that can be used within a component's logic to asynchronously read table data. The main difference between useDexieTable and useDexieGetTable is that useDexieGetTable always returns a function that can get the results of a table and not the results of the table.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                                                                    | Example                                                         |
| --------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| tableName | Optional parameter to specify the name of the table to operate on              | "tasks"                                                         |
| query     | Optional parameter to fetch data using useDexie [Query Syntax] (#query-syntax) | { where:[{ field: 'done', operator: 'equals', value: 'true' }]} |

The callback function returned by useDexieGetTable can be used within the business logic of a component with the following syntax (the parameters are the same as for the useDexieTable function):

```javascript
Array: results = getFunc((String: [tableName]), (Object: [query]), (Function: [callback]));
```

### Callback Example

<a id="markdown-callback-example" name="callback-example"></a>

```javascript
const [uncompleted, setUncompleted] = useState([]);
const getTasks = useDexieGetTable('tasks');

// Some Component Business Logic
const refreshUncompleted = useCallback(() => {
  getTasks({ where: [{ field: 'done', operator: 'equals', value: 'false' }] }, (tasks) => {
    setUncompleted(task);
  });
}, [getTasks]);

// Render a Button to refresh uncompleted task state
return <Button onClick={refreshUncompleted}>Refresh</Button>;
```

## useDexieObj

<a id="markdown-usedexieobj" name="usedexieobj"></a>

```javascript
Object: results = useDexieObj((String: tableName), (Object: [query]), (Function: [callback]),(String: [idFieldName = id]));
```

The operation is the same as useDexieTable as the parameters. The difference is that the hook returns a javascript object.

**You can optionally specify as string type parameter the name of the field you want to use to generate the keys of the object (default: "id")**.

### Example

<a id="markdown-example" name="example"></a>

```javascript
const taskObj = useDexieObj('task');

/* Returns
    {
      T1:{id: 'T1', label: 'Learn useDexie', done: 'false' },
      T2:{id: 'T2', label: 'Advanced useDexie', done: 'false'}
    }
  */

return <span>{taskObk.T1.label}</span>;
```

Using useDexieObj as selector:

```javascript
const T1 = useDexieObj('task', (task) => task.T1);

return <span>{T1.label}</span>;
```

## useDexieMap

<a id="markdown-usedexiemap" name="usedexiemap"></a>

```javascript
Map: results = useDexieMap((String: tableName), (Object: [query]), (Function: [callback]));
```

The operation is the same as useDexieTable as the parameters. The difference is that the hook returns a javascript Map.

**You can optionally specify as string type parameter the name of the field you want to use to generate the keys of the Map (default: "id")**.

### Example

<a id="markdown-example" name="example"></a>

```javascript
const taskMap = useDexieMap('task');

/* Returns
[
  ["T1",{id: 'T1', label: 'Learn useDexie', done: 'false' }],
  ["T2",{id: 'T2', label: 'Advanced useDexie', done: 'false'} ]
]
  */

return <span>{taskMap.get('T1').label}</span>;
```

Using useDexieMap as selector:

```javascript
const T1 = useDexieMap('task', (task) => task.get('T1'));

return <span>{T1.label}</span>;
```

## useDexieSet

<a id="markdown-usedexieset" name="usedexieset"></a>

```javascript
Set: results = useDexieSet((String: tableName), (Object: [query]), (Function: [callback]));
```

The operation is the same as useDexieTable as the parameters. The difference is that the hook returns a javascript Set.

**You can optionally specify as string type parameter the name of the field you want to use to generate the keys of the Set (default: "id")**.

### Example

<a id="markdown-example" name="example"></a>

```javascript
const taskSet = useDexieSet('task');

/* Returns
    {
      T1,
      T2
    }
  */

return <span>{taskSet.as('T1') ? 'Task T1 is here' : 'no T1 in task list'}</span>;
```

## useDexieGetItem

<a id="markdown-usedexiegetitem" name="usedexiegetitem"></a>

```javascript
Object: results || Function: callback = useDexieGetItem((String: tableName), (String: [itemId]), (String: [idField]));
```

useDexieGetItem is a versatile hook that aims to return an object in a table. It can be used in two different ways: "direct" or "deferred" mode as detailed below.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                                                                                                                                                                                                                      | Example |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| tableName | The name of the table to operate on                                                                                                                                                                                              | "tasks" |
| itemId    | The value of the key you want to find. It is of course possible to search for items only through the (or one of) primary keys that you have set in the database schema. The default key that is used by useDexieGetItem is "id". | "T1"    |
| idField   | If you want to operate useDexieGetItem on another primary key than the default one ("id") you can use this parameter to specify the name of the key.                                                                             | "id"    |

If it is used in "deferred" mode and therefore if you do not directly specify the itemId useDexieGetItem returns a callback:

```javascript
function((String: itemId), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                         | Example |
| -------- | --------------------------------------------------- | ------- |
| itemId   | The value of the key you want to find.              | "T1"    |
| callback | An optional callback that returns the searched item | "id"    |

### Example: Direct

<a id="markdown-example%3A-direct" name="example%3A-direct"></a>

The first way is to specify the Id of the content directly in the invocation phase. In this way useDexieGetItem returns the object with the key specified in the way and therefore as soon as it is available:

```javascript
// The default field where the search is performed is "id"
const task = useDexieGetItem('task', 'T1');
```

### Example: Callback

<a id="markdown-example%3A-callback" name="example%3A-callback"></a>

The second way is to specify only the name of the table you want to operate on. In this way useDexieGetItem returns a callback function that can be used within the business logic of the React component.

```javascript
const [default, setDefault] = useState();
const getTask = useDexieGetItem('task');

// Synchronous mode: the result could be undefined on the first invocation
const getTaskById = useCallback((id) => {
  const task = getTask(id);
  return task || {};
}, []);

// Asynchronous mode: provide a callback to get the result as soon as available
const setDefaultTask = useCallback((id) => {
  getTask(id, (task) => {
    setDefault(task);
  });
}, []);
```

## useDexieGetItemKey

<a id="markdown-usedexiegetitemkey" name="usedexiegetitemkey"></a>

```javascript
Function: callback = useDexieGetItemKey((String: tableName));
```

This hook allows you to search for an item in the database and to have its Primary Key as return value.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                         | Example |
| --------- | ----------------------------------- | ------- |
| tableName | The name of the table to operate on | "tasks" |

It returns a callback that can be used within the business logic of the React component.

```javascript
function((Object: query), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                         | Example |
| -------- | --------------------------------------------------- | ------- |
| query    | The value of the key you want to find.              | "T1"    |
| callback | An optional callback that returns the searched item | "id"    |

### Example

<a id="markdown-example" name="example"></a>

```javascript
// The primary key (++) is an auto-generated and auto-incremented id
useDexie('BOOKS_DB', { books: '++, ISBN, title' }, (db) => {
  db.tasks.bulkPut([
    { id: '1', ISBN: 'ABCD1234', title: 'Master React' },
    { id: '2', ISBN: 'EFGH5678', title: 'React for Dummies' },
  ]);
});

const getBookId = useDexieGetItemKey('books');

const getIdByISBN = usecallback((ISBN) => {
  const id = getBookId({ where: [{ field: 'ISBN', operato: 'equals', value: ISBN }] });

  return id;
}, []);
```

## useDexiePutItem

<a id="markdown-usedexieputitem" name="usedexieputitem"></a>

```javascript
Function: callback = useDexiePutItem((String: tableName));
```

This hook allows you to insert an item into a database table. The operation is performed in "upsert" mode i.e. if the item does not exist it is created, if an item with the same primary key already exists it is updated.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                         | Example |
| --------- | ----------------------------------- | ------- |
| tableName | The name of the table to operate on | "tasks" |

It returns a callback that can be used within the business logic of the React component.

```javascript
function((Object: item), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                              | Example                                        |
| -------- | -------------------------------------------------------- | ---------------------------------------------- |
| item     | The item you want to insert                              | { id: 'T3', label: 'Have fun', done: 'false' } |
| callback | An optional callback that returns when operation is done | () => alert("All Done!")                       |

### Example

<a id="markdown-example" name="example"></a>

```javascript
const putTask = useDexiePutItem('task');

const handleUpdateTask = useCallback((task) => {
  putTask(task, () => {
    alert(`Task ${task.id} updated!`);
  });
}, []);
```

## useDexiePutItems

<a id="markdown-usedexieputitems" name="usedexieputitems"></a>

```javascript
Function: callback = useDexiePutItem((String: tableName));
```

This hook allows you to insert multiple items into a database table. The operation is performed in "upsert" mode i.e. if an item does not exist it is created, if an item with the same primary key already exists it is updated.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                         | Example |
| --------- | ----------------------------------- | ------- |
| tableName | The name of the table to operate on | "tasks" |

It returns a callback that can be used within the business logic of the React component.

```javascript
function((Array: items), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                              | Example                                                                                          |
| -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| items    | The Array of items you want to insert                    | [{ id: 'T3', label: 'Have fun', done: 'false' },{ id: 'T4', label: 'Play Hard', done: 'false' }] |
| callback | An optional callback that returns when operation is done | () => alert("All Done!")                                                                         |

### Example

<a id="markdown-example" name="example"></a>

```javascript
const putTasks = useDexiePutItems('task');

const handleUpdateTasks = useCallback((tasks) => {
  putTasks(tasks, () => {
    alert(`Tasks: ${tasks.map((t) => t.id).join(',')} updated!`);
  });
}, []);
```

## useDexieUpdateItem

<a id="markdown-usedexieupdateitem" name="usedexieupdateitem"></a>

```javascript
Function: callback = useDexieUpdateItem((String: tableName));
```

This hook is very convenient as a shortcut to take an item from a table, modify it and then update it without having to use the two hooks useDexieGetItem and useDexiePutItem.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                         | Example |
| --------- | ----------------------------------- | ------- |
| tableName | The name of the table to operate on | "tasks" |

It returns a callback that can be used within the business logic of the React component.

```javascript
function((Object: query), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                                                                                                                                                                                                                     | Example                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| query    | WhereClause Object to get the item you want to modify. WhereClause must be in useDexie [Query Syntax] (#query-syntax)                                                                                                                           | `{ where:[{ field: 'id', operator: 'equals', value: 'T1' }]}` |
| callback | As a second parameter you can pass a callback function that will be invoked by passing the item found in the table. This function, once the item has been modified, must return it as a return value so that it can be updated in the database. | `(item) => { item.done = "true"; return item;}`               |

### Example

<a id="markdown-example" name="example"></a>

```javascript
const updateTask = useDexieUpdateItem('task');

const taskUpdate = useCallback(
  (id) => {
    updateTask({ where: [{ field: 'id', operator: 'equals', value: id }] }, (task) => {
      task.done = 'true';
      return task;
    });
  },
  [updateTask]
);
```

## useDexieDeleteItem

<a id="markdown-usedexiedeleteitem" name="usedexiedeleteitem"></a>

```javascript
Function: callback = useDexiePutItem((String: tableName));
```

This hook allows you to delete an item from a database table.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                         | Example |
| --------- | ----------------------------------- | ------- |
| tableName | The name of the table to operate on | "tasks" |

It returns a callback that can be used within the business logic of the React component.

```javascript
function((Object: item), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                              | Example                  |
| -------- | -------------------------------------------------------- | ------------------------ |
| item     | The item you want to delete                              | "T1"                     |
| callback | An optional callback that returns when operation is done | () => alert("All Done!") |

### Example

<a id="markdown-example" name="example"></a>

```javascript
const deleteTask = useDexieDeleteItem('task');

const handleDeleteTask = useCallback((task) => {
  deleteTask(task, () => {
    alert(`Task ${task.id} deleted!`);
  });
}, []);
```

## useDexieDeleteByQuery

<a id="markdown-usedexiedeletebyquery" name="usedexiedeletebyquery"></a>

```javascript
Function: callback = useDexieDeleteByQuery((String: tableName));
```

This hook allows you to delete multiple items simultaneously from a database table.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                         | Example |
| --------- | ----------------------------------- | ------- |
| tableName | The name of the table to operate on | "tasks" |

It returns a callback that can be used within the business logic of the React component.

```javascript
function((Object: query), (Function: [callback]));
```

### Callback Params

<a id="markdown-callback-params" name="callback-params"></a>

|          | Description                                                                                                           | Example                                                           |
| -------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| query    | WhereClause Object to get the item you want to delete. WhereClause must be in useDexie [Query Syntax] (#query-syntax) | `{ where:[{ field: 'done', operator: 'equals', value: 'true' }]}` |
| callback | As a second parameter you can pass a callback function that will be invoked when the delete operation is done.        | `() => alert("All Done Deleted!");`                               |

### Example

<a id="markdown-example" name="example"></a>

```javascript
const deleteByQuery = useDexieDeleteByQuery('task');

const deleteDoneTasks = useCallback(() => {
  deleteByQuery({ where: [{ field: 'done', operator: 'equals', value: 'true' }] });
}, [updateTask]);

return <button onClick={deleteDoneTasks}>Delete Done</button>;
```

## useDexieMonitor

<a id="markdown-usedexiemonitor" name="usedexiemonitor"></a>

This hook is designed exclusively for Development mode and provides a set of statistical data on database usage at a set frequency. It is useful if you want to implement a small component to monitor the usage and performance of the database during the development phase.

```javascript
Object: data = useDexieMonitor((Number: refresh || null));
```

### Example

<a id="markdown-example" name="example"></a>

```javascript
// DEMO COMPONENT TO VISUALIZE useDexieMonitor
const devMode = process.env.NODE_ENV === 'development';

export default function Monitor(props) {
  const data = useDexieMonitor(devMode ? 500 : null); // if you pass null monitor don't start, otherwise it refresh at freq you passed (in millisecs)

  if (!devMode) return null;

  return (
    <div className={styles.container}>
      {Object.entries(data).map(([key, values]) => {
        const value = Array.isArray(values) ? values.join(', ') : values;
        return (
          <span className={styles.entry}>
            <span className={styles.key}>{key}</span>
            <span className={styles.value}>{value}</span>
          </span>
        );
      })}
    </div>
  );
}
/*
  [Data returned by useDexieMonitor every freq]
 {
 "subscriptions": 2, // number of tables where live refresh is active
 "tables": [ // array of tables where live refresh is active
  "settings",
  "lists"
 ],
 "subscribers": 3, // number of React components subscribed to live refresh
 "maxActive": 3, // max number of active concurrent transactions to db
 "active": 0, // current active transactions to db
 "fulfilled": 3, // total number of transactions to db
 "avg": "754.33", // average response time of transactions
 "avgLast10": "754.33" // average last 10 response time of transactions
}
*/
```

# Query Syntax

<a id="markdown-query-syntax" name="query-syntax"></a>

useDexie uses a simplified syntax to build queries for the DB. The syntax allows you to create multiple And and Or conditions, following the SQL logic as much as possible.

## Where Clause

<a id="markdown-where-clause" name="where-clause"></a>

Compose a WhereClause object is the primary solution to obtain a subset of data from a table.
The allowed operators for building queries are those provided by the Dexie.js library [WhereClause](https://dexie.org/docs/WhereClause/WhereClause).

```javascript
{
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
}
```

The WhereClause object can be dynamically composed, and can be wrapped using React useMemo to optimize performance by reducing updates. If during the composition of the WhereClause object you want to "disable" the filtering operation, just return a null value to get all the records of the table.

```javascript
const [filter, setFilter] = useState();
const tasks = useDexieTable(
  'tasks',
  useMemo(() => {
    if (!filter) return null;
    return {
      where: [{ field: 'done', operator: 'equals', value: filter }],
    };
  }, [filter])
);
```

### Or Clause

<a id="markdown-or-clause" name="or-clause"></a>

It is possible to set queries with a main where clause and a series of clauses in Or:

```javascript
{
  where: [
    {
      field: 'done',
      operator: 'equals',
      value: 'true',
      or: [{ field: 'id', operator: 'oneOf', value: ['T1', 'T2'] }],
    },
  ];
}
```

Alternatively you can set a query with a series of clauses in Or between them:

```javascript
{
  or: [
    { field: 'done', operator: 'equals', value: 'true' },
    { field: 'id', operator: 'oneOf', value: ["T1","T2"] }
  ],
}
```

### And Clause

<a id="markdown-and-clause" name="and-clause"></a>

Given the nature of IndexDB and the way Dexie.js works, you can set queries in AND by adding filters with the following syntax:

```javascript
{
  where: [
    {
      field: 'done',
      operator: 'equals',
      value: 'true',
      and: [{ filter: '(obj) => param.includes(obj.id)', param: ['T1', 'T2'] }],
    },
  ];
}
```

Alternatively you can use an arrow function as filter

```javascript
{
  where: [
    {
      field: 'done',
      operator: 'equals',
      value: 'true',
      and: [{ filter: (obj) => ['T1', 'T2'].includes(obj.id) }],
    },
  ];
}
```

## Filtering

<a id="markdown-filtering" name="filtering"></a>

Alternatively to the composition of a WhereClause you can directly specify a _single_ function to filter the contents of a table you want to obtain. This solution is handy if you want to sort content rusltes. The orderBy option can only be activated with filtering and not by specifying a where clause.

```javascript
{
  filter: (obj) => ['T1', 'T2'].includes(obj.id);
}
```

## Order By

<a id="markdown-order-by" name="order-by"></a>

The orderBy option can only be activated with filtering and not by specifying a where clause.

```javascript
{
  filter: (obj) => ['T1', 'T2'].includes(obj.id);
  orderBy: 'name';
}
```

## Pagination

<a id="markdown-pagination" name="pagination"></a>

```javascript
{
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
  offset: 0,
  limit: 1000
}
```

## Count Results

<a id="markdown-count-results" name="count-results"></a>

```javascript
{
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
  count: true
}
```

# Example: To-Do-List with Create React App

<a id="markdown-example%3A-to-do-list-with-create-react-app" name="example%3A-to-do-list-with-create-react-app"></a>

Below is a simple example of a Create-React-App that implements a to-do list using all available hooks of use-dexie. Of course the use of some features in the example makes no practical sense except to show in practice the use of hooks.

```javascript
import React, { useState, useCallback } from 'react';
import {
  useDexie,
  useDexieTable,
  useDexiePutItem,
  useDexieDeleteItem,
  useDexieDeleteByQuery,
  useDexieGetItem,
  useDexieObj,
  useDexieSet,
  useDexieUpdateItem,
  useDexieGetTable,
} from 'use-dexie';

import './App.css';

function App() {
  useDexie('TASKS_DB', { tasks: 'id, name, done' }, (db) => {
    db.tasks.bulkPut([
      { id: 'T1', label: 'Learn useDexie', done: 'false' },
      { id: 'T2', label: 'Advanced useDexie', done: 'false' },
    ]);
  });

  const updateTask = useDexiePutItem('tasks');
  const deepUpdateTask = useDexieUpdateItem('tasks');
  const deleteTask = useDexieDeleteItem('tasks');
  const deleteByQuery = useDexieDeleteByQuery('tasks');
  const getTask = useDexieGetItem('tasks');
  const allTask = useDexieObj('tasks');
  const completedTask = useDexieSet(
    'tasks',
    {
      where: [{ field: 'done', operator: 'equals', value: 'true' }],
    },
    'label'
  );

  const tasks = useDexieTable('tasks') || [];
  const getTasks = useDexieGetTable('tasks');
  const [task, setTask] = useState();

  const getTaskInfo = useCallback(
    (id) => {
      getTask(id, (task) => alert(JSON.stringify(task, null, 1)));
    },
    [getTask]
  );

  const deepTaskUpdate = useCallback(() => {
    const id = 'T1';
    deepUpdateTask({ where: [{ field: 'id', operator: 'equals', value: id }] }, (task) => {
      task.done = 'true';
      return task;
    });
  }, [deepUpdateTask]);

  const getUncompleted = useCallback(() => {
    getTasks({ where: [{ field: 'done', operator: 'equals', value: 'false' }] }, (tasks) => {
      alert(JSON.stringify(tasks, null, 1));
    });
  }, [getTasks]);

  return (
    <div className="App">
      <table border="1">
        <thead>
          <tr>
            <th>#</th>
            <th>Label</th>
            <th>
              <button
                onClick={(e) =>
                  deleteByQuery({ where: [{ field: 'done', operator: 'equals', value: 'true' }] })
                }
              >
                Delete Competed
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            return (
              <tr key={task.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={task.done === 'true' ? true : false}
                    onChange={() => {
                      updateTask({ ...task, done: task.done === 'true' ? 'false' : 'true' });
                    }}
                  />
                </td>
                <td>
                  <a
                    href={task.id}
                    onClick={(e) => {
                      e.preventDefault();
                      getTaskInfo(task.id);
                    }}
                  >
                    <span style={{ textDecoration: task.done === 'true' ? 'line-through' : '' }}>
                      {task.label}
                    </span>
                  </a>
                </td>
                <td>
                  <button onClick={(e) => deleteTask(task.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan="3">
              <input type="text" onChange={(e) => setTask(e.target.value)} value={task || ''} />
              <button
                onClick={(e) => {
                  if (task) {
                    updateTask({ id: new Date().getTime(), label: task, done: false });
                    setTask('');
                  }
                }}
              >
                ADD
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>
              <button onClick={(e) => alert(JSON.stringify(allTask, null, 1))}>All Tasks</button>
            </td>
            <td>
              <button onClick={(e) => alert([...completedTask.keys()])}>Completed Tasks</button>
            </td>
            <td>
              <button onClick={(e) => getUncompleted()}>Uncompleted Tasks</button>
            </td>
          </tr>
          <tr>
            <td colSpan="3">
              <button onClick={(e) => deepTaskUpdate()}>Complete T1</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default App;
```

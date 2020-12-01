![useDexie](https://github.com/ttessarolo/useDexie/blob/main/images/logo.png?raw=true)

React Hooks to use Dexie.js IndexDB library with ease

![NPM](https://img.shields.io/npm/v/use-dexie/latest)
![NPM](https://img.shields.io/npm/dw/use-dexie)
![NPM](https://img.shields.io/npm/l/use-dexie)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/use-dexie)

Dexie.js is a gorgeous library to use **IndexDB** with simple and powerful syntax. However, if you want to use Dexie.js within a **React** project you need to implement a series of logics that allow asynchronous interaction. For this purpose, use-dexie is a library that includes a series of **React Hooks** that allow you to easily use IndexDB as a data source for React applications. In many cases the use of **use-dexie** allows to completely replace the use of status libraries such as Redux while ensuring a higher execution speed (data can be pre-loaded) and, of course, persistence.

The use-dexie hooks have been optimized to ensure:

- 🔥 Realtime Refresh of React elements that depend on a data source
- ♻️ Minimizing the number of refreshes to bare minimum
- ⚡️ Maximum Speed and Minimum memory footprint

<h1>Index of Content</h1>

<!-- TOC -->

- [Installation](#installation)
- [Example](#example)
- [Hooks](#hooks)
  - [useDexie](#usedexie)
    - [Params](#params)
    - [useDexie Example](#usedexie-example)
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
  - [useDexieGetItemKey](#usedexiegetitemkey)
  - [useDexiePutItem](#usedexieputitem)
  - [useDexieUpdateItem](#usedexieupdateitem)
  - [useDexieDeleteItem](#usedexiedeleteitem)
  - [useDexieDeleteByQuery](#usedexiedeletebyquery)
- [Query Syntax](#query-syntax) - [Basic Where Clause](#basic-where-clause) - [Or Clause](#or-clause) - [And Clause](#and-clause) - [Pagination](#pagination) - [Count Results](#count-results)

<!-- /TOC -->

# Installation

<a id="markdown-installation" name="installation"></a>

```javascript
npm install use-dexie
```

# Example

<a id="markdown-example" name="example"></a>

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

### useDexie Example

<a id="markdown-usedexie-example" name="usedexie-example"></a>

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
- to receive only one set of results depending on a query
- as a selector to select and process table content

useDexieTable can be used asynchronously by returning the result when available, or a callback can be provided to process the result inline.

### Params

<a id="markdown-params" name="params"></a>

|           | Description                                                                                                                                                                                                     | Example                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| tableName | The name of the table to operate on                                                                                                                                                                             | "tasks"                                                         |
| query     | Optional parameter to fetch data using useDexie [Query Syntax] (#query-syntax)                                                                                                                                  | { where:[{ field: 'done', operator: 'equals', value: 'true' }]} |
| callback  | On optional callback to retrieve and process query/table results. Da notare che il risultato della callback viene restituito dalla funzione useDexieTable dando la possibilità di utilizzarla come un selector. | (results) => doSomething(results)                               |
|           |

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

_Coming Soon_

## useDexieGetItemKey

<a id="markdown-usedexiegetitemkey" name="usedexiegetitemkey"></a>

_Coming Soon_

## useDexiePutItem

<a id="markdown-usedexieputitem" name="usedexieputitem"></a>

_Coming Soon_

## useDexieUpdateItem

<a id="markdown-usedexieupdateitem" name="usedexieupdateitem"></a>

_Coming Soon_

## useDexieDeleteItem

<a id="markdown-usedexiedeleteitem" name="usedexiedeleteitem"></a>

_Coming Soon_

## useDexieDeleteByQuery

<a id="markdown-usedexiedeletebyquery" name="usedexiedeletebyquery"></a>

_Coming Soon_

# Query Syntax

<a id="markdown-query-syntax" name="query-syntax"></a>

useDexie uses a simplified syntax to build queries for the DB. The syntax allows you to create multiple And and Or conditions, following the SQL logic as much as possible. The allowed operators for building queries are those provided by the Dexie.js library.

### Basic Where Clause

<a id="markdown-basic-where-clause" name="basic-where-clause"></a>

```javascript
{
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
}
```

### Or Clause

<a id="markdown-or-clause" name="or-clause"></a>

It is possible to set queries with a main where clause and a series of clauses in Or:

```javascript
{
  where: [
    { field: 'done', operator: 'equals', value: 'true' }
  ],
  or:[
    { field: 'id', operator: 'oneOf', value: ["T1","T2"] }
  ]
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
    { field: 'done', operator: 'equals', value: 'true' }
  ],
  and:[
    { filter: "(obj) => param.includes(obj.id)", param:["T1","T2"] }
  ]
}
```

### Pagination

<a id="markdown-pagination" name="pagination"></a>

```javascript
{
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
  offset: 0,
  limit: 1000
}
```

### Count Results

<a id="markdown-count-results" name="count-results"></a>

```javascript
{
  where: [{ field: 'done', operator: 'equals', value: 'true' }],
  count: true
}
```

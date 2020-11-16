# useDexie

React Hooks to use Dexie.js IndexDB library with ease

![NPM](https://img.shields.io/npm/v/use-dexie/latest)
![NPM](https://img.shields.io/npm/dw/use-dexie)
![NPM](https://img.shields.io/npm/l/use-dexie)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/use-dexie)
![NPM](https://img.shields.io/badge/4R3S-PR0DUCT10N-magenta)

# 🍱 Example

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
    db.tasks
      .bulkAdd([
        { id: 'T1', label: 'Learn useDexie', done: 'false' },
        { id: 'T2', label: 'Advanced useDexie', done: 'false' },
      ])
      .catch((e) => {
        //ignore Exception to avoid use put + reload deleted data
      });
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

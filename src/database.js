import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8').then(data => {
      this.#database = JSON.parse(data)
    })
    .catch(() => {
      this.#persist()
    })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }


  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }



  insert(table, data) {
    if(Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist();

    return data
  }



  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if(rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist();
    }
  }



  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if(rowIndex > -1) {
      this.#database[table][rowIndex] = { 
        id, 
        ...data, 
        created_at: data.created_at !== undefined ? data.created_at : this.#database[table][rowIndex].created_at,
        completed_at: data.completed_at !== undefined ? data.completed_at : this.#database[table][rowIndex].completed_at,  
      }
      this.#persist();
    }
  }



  patch(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);
  
    if (rowIndex > -1) {
      this.#database[table][rowIndex] = {
        ...this.#database[table][rowIndex],
        ...data,
        title: data.title !== undefined ? data.title : this.#database[table][rowIndex].title,
        description: data.description !== undefined ? data.description : this.#database[table][rowIndex].description,
        completed_at: data.completed_at !== undefined ? data.completed_at : this.#database[table][rowIndex].completed_at, 
      };
      this.#persist();
    }
  }
  
}
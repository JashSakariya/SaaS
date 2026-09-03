/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.post('/user', 'UsersController.store')
Route.post('/login', 'UsersController.login')
Route.post('/refresh', 'AuthController.refresh')
Route.get('/clients', 'ClientsController.index')
Route.post('/clients', 'ClientsController.store')
Route.put('/clients/:id', 'ClientsController.update')
Route.delete('/clients/:id', 'ClientsController.destroy')
Route.get('/client/:id', 'ClientsController.show')


//projects fetch, store , get, update, delete.


//update vala controller thi baki .......

Route.get('/client/:id/projects', 'ProjectsController.index')
Route.post('/client/:id/projects', 'ProjectsController.store')
Route.get('/client/:id/projects/:pid', 'ProjectsController.show')
Route.put('/client/:id/projects/:pid', 'ProjectsController.update')
Route.delete('/client/:id/projects/:pid', 'ProjectsController.destroy')


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
Route.get('/client/:id/projects', 'ProjectsController.index')
Route.post('/client/:id/projects', 'ProjectsController.store')
Route.get('/client/:id/projects/:pid', 'ProjectsController.show')
Route.put('/client/:id/projects/:pid', 'ProjectsController.update')
Route.delete('/client/:id/projects/:pid', 'ProjectsController.destroy')

// tasks fetch, store, get, update, delete
Route.get('/client/:id/projects/:pid/tasks', 'TasksController.index')
Route.post('/client/:id/projects/:pid/tasks', 'TasksController.store')
Route.get('/client/:id/projects/:pid/tasks/:tid', 'TasksController.show')
Route.put('/client/:id/projects/:pid/tasks/:tid', 'TasksController.update')
Route.delete('/client/:id/projects/:pid/tasks/:tid', 'TasksController.destroy')

// task comments fetch, store, update, delete
Route.get('/client/:id/projects/:pid/tasks/:tid/comments', 'TaskCommentsController.index')
Route.post('/client/:id/projects/:pid/tasks/:tid/comments', 'TaskCommentsController.store')
Route.put('/client/:id/projects/:pid/tasks/:tid/comments/:cid', 'TaskCommentsController.update')
Route.delete('/client/:id/projects/:pid/tasks/:tid/comments/:cid', 'TaskCommentsController.destroy')




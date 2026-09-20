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

// developers fetch, store, get, update, delete
Route.get('/developers', 'DevelopersController.index')
Route.post('/developers', 'DevelopersController.store')
Route.get('/developers/:id', 'DevelopersController.show')
Route.put('/developers/:id', 'DevelopersController.update')
Route.delete('/developers/:id', 'DevelopersController.destroy')


//invoice fetch, store, get, update, delete

Route.group(() => {
    Route.get('/', 'InvoicesController.index')           // list all invoices
    Route.post('/', 'InvoicesController.store')          // create invoice
    Route.get('/:id', 'InvoicesController.show')         // view one invoice
    Route.put('/:id', 'InvoicesController.update')       // update invoice
    Route.delete('/:id', 'InvoicesController.destroy')   // delete invoice
    Route.patch('/:id/status', 'InvoicesController.updateStatus')   // status change
    Route.put('/:id/status', 'InvoicesController.updateStatus')     // status change fallback
    Route.get('/:id/pdf', 'InvoicesController.downloadPdf')          // PDF download
    Route.post('/:id/send-email', 'InvoicesController.sendEmail')    // email bhejna
}).prefix('/invoices')

// plans fetch, store, get, update, delete
Route.group(() => {
  Route.get('/', 'PlansController.index')
  Route.post('/', 'PlansController.store')
  Route.get('/:id', 'PlansController.show')
  Route.put('/:id', 'PlansController.update')
  Route.delete('/:id', 'PlansController.destroy')
}).prefix('/plans')

// Root & /admin redirects
Route.get('/', async ({ response }) => {
  return response.redirect('/admin/plans')
})
Route.get('/admin', async ({ response }) => {
  return response.redirect('/admin/plans')
})

// Admin Plan Management (Edge Dashboard)
Route.group(() => {
  Route.get('/', 'AdminPlansController.index')
  Route.post('/', 'AdminPlansController.store')
  Route.post('/:id/update', 'AdminPlansController.update')
  Route.post('/:id/delete', 'AdminPlansController.destroy')
}).prefix('/admin/plans')


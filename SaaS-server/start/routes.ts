import Route from '@ioc:Adonis/Core/Route'

// Public Routes
Route.post('/user', 'UsersController.store')
Route.post('/login', 'UsersController.login')
Route.post('/refresh', 'AuthController.refresh')

// Protected Routes (Require JWT Auth)
Route.group(() => {
  // Dashboard
  Route.get('/dashboard/stats', 'DashboardController.stats')

  // User Profile & Settings
  Route.get('/user/profile', 'UsersController.profile')
  Route.put('/user/profile', 'UsersController.updateProfile')
  Route.put('/user/change-password', 'UsersController.changePassword')

  // Clients
  Route.get('/clients', 'ClientsController.index')
  Route.post('/clients', 'ClientsController.store')
  Route.put('/clients/:id', 'ClientsController.update')
  Route.delete('/clients/:id', 'ClientsController.destroy')
  Route.get('/client/:id', 'ClientsController.show')

  // Projects
  Route.get('/client/:id/projects', 'ProjectsController.index')
  Route.post('/client/:id/projects', 'ProjectsController.store')
  Route.get('/client/:id/projects/:pid', 'ProjectsController.show')
  Route.put('/client/:id/projects/:pid', 'ProjectsController.update')
  Route.delete('/client/:id/projects/:pid', 'ProjectsController.destroy')

  // Tasks
  Route.get('/client/:id/projects/:pid/tasks', 'TasksController.index')
  Route.post('/client/:id/projects/:pid/tasks', 'TasksController.store')
  Route.get('/client/:id/projects/:pid/tasks/:tid', 'TasksController.show')
  Route.put('/client/:id/projects/:pid/tasks/:tid', 'TasksController.update')
  Route.delete('/client/:id/projects/:pid/tasks/:tid', 'TasksController.destroy')

  // Task comments
  Route.get('/client/:id/projects/:pid/tasks/:tid/comments', 'TaskCommentsController.index')
  Route.post('/client/:id/projects/:pid/tasks/:tid/comments', 'TaskCommentsController.store')
  Route.put('/client/:id/projects/:pid/tasks/:tid/comments/:cid', 'TaskCommentsController.update')
  Route.delete('/client/:id/projects/:pid/tasks/:tid/comments/:cid', 'TaskCommentsController.destroy')

  // Developers
  Route.get('/developers', 'DevelopersController.index')
  Route.post('/developers', 'DevelopersController.store')
  Route.get('/developers/:id', 'DevelopersController.show')
  Route.put('/developers/:id', 'DevelopersController.update')
  Route.delete('/developers/:id', 'DevelopersController.destroy')

  // Invoices (API operations)
  Route.group(() => {
    Route.get('/', 'InvoicesController.index')
    Route.post('/', 'InvoicesController.store')
    Route.get('/:id', 'InvoicesController.show')
    Route.put('/:id', 'InvoicesController.update')
    Route.delete('/:id', 'InvoicesController.destroy')
    Route.patch('/:id/status', 'InvoicesController.updateStatus')
    Route.put('/:id/status', 'InvoicesController.updateStatus')
    Route.post('/:id/send-email', 'InvoicesController.sendEmail')
  }).prefix('/invoices')

  // Plans
  Route.group(() => {
    Route.get('/', 'PlansController.index')
    Route.post('/', 'PlansController.store')
    Route.get('/:id', 'PlansController.show')
    Route.put('/:id', 'PlansController.update')
    Route.delete('/:id', 'PlansController.destroy')
  }).prefix('/plans')

  // Payments & Checkout
  Route.group(() => {
    Route.get('/subscription/current', 'PaymentsController.currentSubscription')
    Route.post('/create-order', 'PaymentsController.createOrder')
    Route.post('/verify', 'PaymentsController.verifyPayment')
  }).prefix('/payments')
}).middleware('auth')

// Invoice PDF Download (accessible via direct browser window.open)
Route.get('/invoices/:id/pdf', 'InvoicesController.downloadPdf')

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


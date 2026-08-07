<template>
  <div class="dashboard">

    <!-- Navbar -->
    <header class="navbar">
      <div class="logo">MyApp</div>

      <div class="navbar-right">
        <span>Welcome, Jash 👋</span>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="main">

      <!-- Sidebar -->
      <aside class="sidebar">
        <ul>
          <li class="active">🏠 Dashboard</li>
          <li>👤 Users</li>
          <li>📦 Orders</li>
          <li>💰 Payments</li>
          <li>📊 Reports</li>
          <li>⚙️ Settings</li>
        </ul>
      </aside>

      <!-- Content -->
      <section class="content">

        <div class="welcome">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's today's overview.</p>
        </div>

        <!-- Cards -->
        <div class="cards">

          <div class="card">
            <h3>Total Users</h3>
            <h2>150</h2>
          </div>

          <div class="card">
            <h3>Total Orders</h3>
            <h2>95</h2>
          </div>

          <div class="card">
            <h3>Revenue</h3>
            <h2>₹2,45,000</h2>
          </div>

          <div class="card">
            <h3>Pending Orders</h3>
            <h2>12</h2>
          </div>

        </div>

        <!-- Table -->
        <div class="table-container">

          <h2>Recent Users</h2>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>John</td>
                <td>john@gmail.com</td>
                <td>Active</td>
              </tr>

              <tr>
                <td>Emma</td>
                <td>emma@gmail.com</td>
                <td>Active</td>
              </tr>

              <tr>
                <td>Alex</td>
                <td>alex@gmail.com</td>
                <td>Inactive</td>
              </tr>

              <tr>
                <td>David</td>
                <td>david@gmail.com</td>
                <td>Pending</td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<style scoped>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

.dashboard{
    height:100vh;
    width:100%;
    background:#f4f6fb;
    font-family:Arial, Helvetica, sans-serif;
}

/* Navbar */

*{
  color:black;
}

.navbar{
    height:70px;
    width:100%;
    background:#4f46e5;
    color:white;

    display:flex;
    justify-content:space-between;
    align-items:center;

    padding:0 40px;
}

.logo{
    font-size:28px;
    font-weight:bold;
}

.navbar-right{
    display:flex;
    align-items:center;
    gap:20px;
}

.logout-btn{
    padding:10px 20px;
    border:none;
    border-radius:8px;
    cursor:pointer;
    background:white;
    color:#4f46e5;
    font-weight:bold;
}

/* Layout */

.main{
    display:flex;
    height:calc(100vh - 70px);
}

/* Sidebar */

.sidebar{
    width:240px;
    background:white;
    border-right:1px solid #ddd;
}

.sidebar ul{
    list-style:none;
}

.sidebar li{
    padding:20px 25px;
    cursor:pointer;
    font-size:17px;
    border-bottom:1px solid #eee;
    /* color: black */
}

.sidebar li:hover{
    background:#4f46e5;
    color:white;
}

.active{
    background:#4f46e5;
    color:white;
}

/* Content */

.content{
    flex:1;
    padding:35px;
    overflow:auto;
}

.welcome{
    margin-bottom:30px;
}

.welcome h1{
    font-size:34px;
    margin-bottom:10px;
    color:black
}

.welcome p{
    color:#666;
}

/* Cards */

.cards{

    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:25px;

    margin-bottom:40px;

}

.card{

    background:white;
    border-radius:12px;
    padding:30px;

    box-shadow:0 5px 15px rgba(0,0,0,.08);

}

.card h3{
    color:#666;
    margin-bottom:20px;
}

.card h2{
    color:#4f46e5;
    font-size:34px;
}

/* Table */

.table-container{

    background:white;
    padding:30px;

    border-radius:12px;

    box-shadow:0 5px 15px rgba(0,0,0,.08);

}

.table-container h2{
    margin-bottom:20px;
}

table{

    width:100%;
    border-collapse:collapse;

}

th{

    background:#4f46e5;
    color:white;
    padding:15px;

    text-align:left;

}

td{

    padding:15px;
    border-bottom:1px solid #ddd;

}

tr:hover{
    background:#f5f5f5;
}

</style>
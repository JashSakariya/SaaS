<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Welcome Back</h1>
      <p class="subtitle">Sign in to continue</p>

      <form @submit.prevent="onLogin">
        <div class="login-toggle">
          <button 
            type="button"
            :class="{ active: loginType =='email'}"
            @click="loginType='email'"
          >Email
        </button>
          <button 
            type="button"
            :class="{ active: loginType =='Mobile'}"
            @click="loginType='Mobile'"
            >
            Mobile
          </button>
//change some for try
        </div>

        <div class="input-group" v-if="loginType=='Mobile'">
          <label>Mobile</label>
          <input
            v-model="login.Mobile"
            type="tel"
            placeholder="Enter your mobile number"
            required
          />
        </div>

        <div class="input-group" v-if="loginType=='email'">
          <label>Email</label>
          <input
            v-model="login.email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="input-group">
          <label>Password</label>
          <input
            v-model="login.password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div class="options">
          <label>
            <input type="checkbox" />
            Remember Me
          </label>

          <a href="#">Forgot Password?</a>
        </div>

        <button type="submit">Login</button>
      </form>

      <p class="signup-link">
        Don't have an account?
        <router-link to="/">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref , watch } from "vue";
import api from '@/services/ApiService';
import { useRouter } from 'vue-router';
const router = useRouter()
const loginType = ref("email")

// watch(loginType, (newValue, oldValue) => {
//   console.log('Old:', oldValue)
//   console.log('New:', newValue)
// })

interface Login {
  loginType:string;
  email: string;
  Mobile:string;
  password: string;
}

const login = ref<Login>({
  loginType: loginType.value,
  email: "",
  Mobile:"",
  password: "",

});
//this changes happen in login
const onLogin = async() => {
  login.value.loginType = loginType.value;
  // console.log(login.value);
  try{
    const response = await api.post('/login', login.value) 
    console.log("response from server of login",response)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    router.push('/home')

  }catch(error){
    console.error(error)

  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


.login-toggle {
  display: flex;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.login-toggle button {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-weight: 500;
  color:#333
}

.login-toggle button.active {
  background: #4f46e5;
  color: white;
}


.login-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-card {
  color:#333;
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 35px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.login-card h1 {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #777;
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 5px rgba(79, 70, 229, 0.4);
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.options a {
  text-decoration: none;
  color: #4f46e5;
}

.options a:hover {
  text-decoration: underline;
}

button {
  width: 100%;
  padding: 13px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: 0.3s;
}

button:hover {
  background: #4338ca;
}

.signup-link {
  text-align: center;
  margin-top: 25px;
  color: #555;
}

.signup-link a {
  color: #4f46e5;
  font-weight: bold;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
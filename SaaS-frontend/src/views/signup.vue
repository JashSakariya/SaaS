<template>
    <div id="main">
    <div class="signup-container">
        <div class="signup-card">
            <h2>Create Account</h2>
            <p class="subtitle">Sign up to continue</p>

            <form @submit.prevent="onSubmit">

                <div class="form-group">
                    <label>Name</label>
                    <input v-model="user.name" type="text" placeholder="Enter your name" />
                </div>

                <div class="form-group">
                    <label>Email</label>
                    <input v-model="user.email" type="email" placeholder="Enter your email" />
                </div>

                <div class="form-group">
                    <label>Mobile Number</label>
                    <input v-model="user.mobile_number" type="tel" placeholder="Enter your mobile number" />
                </div>

                <div class="form-group">
                    <label>Gender</label>

                    <div class="radio-group">
                        <label>
                            <input type="radio" value="Male" v-model="user.gender" />
                            Male
                        </label>

                        <label>
                            <input type="radio" value="Female" v-model="user.gender" />
                            Female
                        </label>

                        <label>
                            <input type="radio" value="Other" v-model="user.gender" />
                            Other
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" v-model="user.dob" />
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" v-model="user.password" placeholder="Enter password" />
                </div>

                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" v-model="user.confirm_password" placeholder="Confirm password" />
                </div>

                <button class="signup-btn" type="submit">
                    Create Account
                </button>

            </form>
        </div>
    </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/ApiService';

const router = useRouter()
const user = ref<User>(
    {
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        dob: "",
        gender: "",
        mobile_number: ""
    }
)
interface User {
    name: string
    email: string
    password: string
    confirm_password: string
    dob: string
    gender: string
    mobile_number: string
}

const onSubmit = async () => {
    if(user.value.password !== user.value.confirm_password){
        alert("password and conf password is not match..")
        return 
    }

    try {
        const response = await api.post('/user', user.value)
        console.log("this is response from back : ", response.data)
        console.log("data is submitted....", user)
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        await router.push('/home')

    } catch (error: any) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message
        console.error("registration failed:", errorMsg)
        alert("Registration failed: " + errorMsg)
    }


}
</script>
<style scoped>
* {
    box-sizing: border-box;
    color:#0d1317;
}

.signup-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f4f7fb;
    padding: 30px;
}



.signup-card {
    width: 430px;
    background: #fff;
    padding: 35px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, .08);
}

.signup-card h2 {
    text-align: center;
    margin-bottom: 8px;
}



.subtitle {
    text-align: center;
    color: #0d1317;
    margin-bottom: 25px;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 18px;
}

.form-group label {
    margin-bottom: 7px;
    font-weight: 600;
}

.form-group input {
    padding: 12px;
    border: 1px solid #d7d7d7;
    border-radius: 8px;
    outline: none;
    font-size: 15px;
    transition: .3s;
}

.form-group input:focus {
    border-color: #4f7cff;
    box-shadow: 0 0 0 3px rgba(79, 124, 255, .15);
}

.radio-group {
    display: flex;
    gap: 25px;
    margin-top: 5px;
}

.radio-group label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
}

.signup-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 8px;
    background: #4f7cff;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: .3s;
    margin-top: 10px;
}

.signup-btn:hover {
    background: #3569ff;
}
</style>
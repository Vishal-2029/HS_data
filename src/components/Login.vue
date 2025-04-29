<template>
  <div class="container">
    <h1>Login to Your Account</h1>
    <form class="form" @submit.prevent="submitForm">
      <div>
        <input type="text" id="user" v-model="formData.username" placeholder="Username" required/>
      </div>
      <br />
      <div>
        <input type="password" id="password" v-model="formData.password" placeholder="Password" required/>
      </div>
      <br />
      <button type="submit">LOGIN</button>
      <p v-if="message" style="color: red; margin-top: 10px">{{ message }}</p>
    </form>
  </div>
</template>

<script>
export default {
  name: 'LOGIN',

  data() {
    return {
      formData: {
        username: '',
        password: '',
      },
      message: '',
    };
  },

  methods: {
    async submitForm() {
      try {
        const response = await fetch('https://dev.hstrader.com/auth/v1/oauth2/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${this.formData.username}:${this.formData.password}`),
          },
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
    console.log('Login response:', data);

    if (response.ok ) {
      console.log("Token",data)
      localStorage.setItem('token', data.data.access_token);
      this.$router.push('/dashboard');
    } else {
      this.message = data.message 
    }


      } catch (error) {
        console.error('Error during login:', error);
        this.message = 'An error occurred during login.';
      }
    },
  },
};
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  max-width: 400px;
  margin: 100px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-out;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 12px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  outline: none;
}

button {
  background-color: #4f46e5;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}
</style>

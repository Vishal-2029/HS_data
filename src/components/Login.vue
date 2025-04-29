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


<style scoped>
.container {
  background: #f4f7f5;
  max-width: 420px;
  margin: 100px auto;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 10px 10px 20px #d1d5d2, -10px -10px 20px #ffffff;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  font-size: 22px;
  color: #2e7d32;
  margin-bottom: 25px;
}

input[type='text'],
input[type='password'] {
  width: 100%;
  padding: 14px;
  margin-bottom: 20px;
  background: #f4f7f5;
  border: none;
  border-radius: 12px;
  box-shadow: inset 4px 4px 8px #d1d5d2, inset -4px -4px 8px #ffffff;
  font-size: 14px;
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #81c784;
}

button {
  padding: 12px 30px;
  background-color: #66bb6a;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover {
  background-color: #388e3c;
}
</style>



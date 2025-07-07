import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://notes-backend-yupx.onrender.com/api', // replace with actual Render URL
});

export default instance;

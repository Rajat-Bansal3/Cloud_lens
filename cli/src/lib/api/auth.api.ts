import axios from "axios";

const axiosInst = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const signup = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const res = await axiosInst.post("/auth/aign-up", {
    username,
    email,
    password,
  });
  if (res.status === 200) {
  }
};

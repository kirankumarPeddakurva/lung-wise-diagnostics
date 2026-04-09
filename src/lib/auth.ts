export interface User {
  email: string;
  name: string;
}

export function getUser(): User | null {
  const raw = localStorage.getItem("lung-app-user");
  return raw ? JSON.parse(raw) : null;
}

export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    const userData = { email: user.email, name: user.name };
    localStorage.setItem("lung-app-user", JSON.stringify(userData));
    return userData;
  }
  return null;
}

export function register(name: string, email: string, password: string): User | null {
  const users = getUsers();
  if (users.find((u) => u.email === email)) return null;
  users.push({ name, email, password });
  localStorage.setItem("lung-app-users", JSON.stringify(users));
  const userData = { email, name };
  localStorage.setItem("lung-app-user", JSON.stringify(userData));
  return userData;
}

export function logout() {
  localStorage.removeItem("lung-app-user");
}

function getUsers(): { name: string; email: string; password: string }[] {
  const raw = localStorage.getItem("lung-app-users");
  return raw ? JSON.parse(raw) : [{ name: "Demo User", email: "demo@lung.ai", password: "demo123" }];
}

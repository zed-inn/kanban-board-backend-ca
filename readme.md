# Kanban Board - Fastify + Pg + Socket.io

## Routes

### Authentication

#### /auth/login - Login

Login via email and password

**Body :**

```ts
{
  email: string;
  password: string;
}
```

### /auth/signup - Signup

Signup via email and password

**Body :**

```ts
{
  email: string;
  password: string;
}
```

### /auth/logout - Logout

Logs out a logged in user.

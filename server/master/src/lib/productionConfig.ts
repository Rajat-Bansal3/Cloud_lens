const productionConfig = {
  corsOptions: {
    origin: "frontend",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  helmetOptions: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://trusted-scripts.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  },
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 100,
    minPoolSize: 10,
    socketTimeoutMS: 30000,
    family: 4,
  },
  jwtOptions: {},
};

export default productionConfig;

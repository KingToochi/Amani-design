import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  let token;

  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (
    authHeader &&
    authHeader.startsWith("Bearer ")
  ) {
    token = authHeader.split(" ")[1];
  }

  // If no Authorization token,
  // try the HTTP-only cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  // No token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach authenticated user to request
    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT verification error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default verifyToken;
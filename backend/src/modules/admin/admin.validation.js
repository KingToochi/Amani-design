export const validateAdmin = (user) => {
    if (!user || user.role !== "admin") {
        const error = new Error("Access denied")
        error.statusCode = 403
      throw error;
    }

    return user
}


export const validateAdminLoginData = ({email, password}) => {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }
    

    return
}

export const validateAdminAccessCode = (adminAccessCode) => {
  const storedCode = process.env.ADMIN_ACCESS_CODE?.trim();
  const suppliedCode = String(adminAccessCode ?? "").trim();

  if (!storedCode || !suppliedCode || storedCode !== suppliedCode) {
    const error = new Error("Invalid access code")
    error.statusCode = 401
    throw error
  }
};
export const generateToken = async (userIdentifier,  options = { expiresIn: "1h" }) => {
  const normalizedIdentifier = String(userIdentifier).trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  });
   if (!user) {
    throw new Error("User not found")
  }
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    JWT_SECRET ,
    options
  )

  return token
}
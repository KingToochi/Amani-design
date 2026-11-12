
function OptimizedImage({
  src,
  alt,
  className,
  loading = "lazy",
  priority = false
}) {
  const isCloudinaryUrl =
    typeof src === "string" && src.includes("res.cloudinary.com/");
  const optimizedSrc = isCloudinaryUrl
    ? src.replace(
        /\/upload\/(?![^/]*(?:f_auto|q_auto))/,
        "/upload/f_auto,q_auto/"
      )
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      loading={priority ? "eager" : loading}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

export default OptimizedImage;
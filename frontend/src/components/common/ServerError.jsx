const ServerError = ({ serverError }) => {

    console.log(serverError)
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg border border-red-700 min-w-[300px] max-w-[90%] animate-bounce">
      <p className="font-semibold text-sm md:text-base text-center">
        {serverError.message || "Something went wrong. Please try again."}
      </p>
    </div>
  );
};

export default ServerError;
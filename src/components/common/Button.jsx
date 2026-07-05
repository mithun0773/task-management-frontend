
const Button = ({children,onClick,variant = 'primary',disabled=false}) => {

    const baseStyles = "px-4 py-2 rounded font-medium transition-colors duration-200";
    const variants = {
        primary:"bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
        secondary:"bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
        danger:"bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
        success:"bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300",
    };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]}`}>
        {children}
    </button>
  )
}

export default Button

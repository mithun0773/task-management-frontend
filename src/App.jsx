import AppRoutes from "./routes/AppRoutes"
import {Toaster} from "react-hot-toast"
const App = () => {
  
  return (
    <div>
      <AppRoutes />
      <Toaster position="top-right" />
    </div>
  )
}

export default App

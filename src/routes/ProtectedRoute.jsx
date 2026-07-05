import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const ProtectedRoute = ({children,allowedRoles}) => {
    const {isAuthenticated,user,loading} = useAuth();

    const DEV_BYPASS = false;
    if(loading && !DEV_BYPASS){
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        );
    }
if(!DEV_BYPASS){
    if(!isAuthenticated){
        return <Navigate to="/login" replace/>
    }
    if(allowedRoles && user && !allowedRoles.includes(user.role)){
        return <Navigate to="/dashbaord" replace/>

    }
}
  return (
    <>
    {children}
    </>
  )
}

export default ProtectedRoute

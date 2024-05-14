const authToken = localStorage.getItem("authToken");
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
let requestOptions = {} ; 

const APIHandler = async (method, payload, route) => {
    
    try {
        let request = `${baseURL}${route}` ; 

        if (authToken === null){

            requestOptions = {
                method: `${method}`,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8', 
                }
            };   

        }   else{

            requestOptions = {
                method: `${method}`,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8', 
                    'Authorization': `${authToken}`
                }
            };   
        }

        if (method != "GET"){
            requestOptions['body'] = JSON.stringify(payload)
        }
        
        let response = await fetch(request, requestOptions) ;   
        let responseData = await response.json() ;
        return responseData ; 

    } catch (error) {
        console.log(error);
        return false
    }
}

export {APIHandler} ; 
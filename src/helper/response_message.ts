const ResponseMessage = (xcode?: number): string => {
    switch (xcode) {
        case 200:
            return "SUCCESS";
        case 400:
            return "No Data Found!";
        case 401:
            return "Unauthorized!";
        case 404:
            return "Not Found!";
        case 408:
            return "Request Timeout!";
        case 409:
            return "The request could not be completed due to a conflict with the current state of the resource.";
        case 463:
            return "The HTTP POST data has lacking required parameters. This would be a good time to double check spelling.";
        case 500:
            return "Internal Server Error.";
        case 503:
            return "Service Unavailable.";
        case 0:
            return "Unable to process request. The system encountered some technical problem. Sorry for the inconvenience.";
        case 1:
            return "Unable to process request. Please review your data and try again.";
        case 2:
            return "Unable to process request. Connection timeout occured. Please try again later.";
        case 3:
            return "Unable to process request. Failed in connecting to server. Please try again later.";
        case 4:
            return "Incorrect Username Or Password. Please Try Again.";
        case 5:
            return "System encountered duplicate record. Please remove the duplicated transaction and upload again.";
        case 6:
            return "Already paid/processs.";
        case 7:
            return "Request Message sent!";
        case 8:
            return "Inactive User!";
        case 9:
            return "Successfully Log-in";
        case 10:
            return "Successfully Saved";
        case 11:
            return "Already fulfilled";
        case 12:
            return "Successfully Disabled Seller.";
        case 13:
            return "Unable to Process request. Please check if all wallet number's are registered in KP Mobile.";
        case 14:
            return "Successfully Cancelled.";
        case 15:
            return "This Account cannot transact load with the same amount within 5 minutes. Please try again later.";
        case 16:
            return "RequiredParameterMissing.";
        case 17:
            return "Error";
        case 18:
            return "System encountered an unregistered wallet number. Please verify this data and upload again:";
        case 19:
            return "System encountered a wallet number that does not match the supplied firstname/lastname. Please verify your data and upload again.";
        case 20:
            return "Unable to send notification message.";
        case 21:
            return "Notification Message sent!";
        case 22:
            return "Shop name already exists.";
        case 23:
            return "Email and Password Field Empty!";
        case 24:
            return "Email Field Required!";
        case 25:
            return "Password Field Required"
        case 26:
            return "Wrong Email/Password!";
        case 27:
            return "Success in Sending Email Message.";
        case 28:
            return "Failed in Sending Email Message. Something went wrong. Please try again later.";
        case 29:
            return "Seller Successfully Enabled.";
        case 30:
            return "The minimum password length must be greater than 5 characters and maximum password length is 20 characters";
        case 31:
            return "Password must have at least one lowercase letter, one uppercase letter, one digit and one special character."
        case 32:
            return "Password Successfully Changed."
        case 33:
            return "No Token Provided.";
        case 34:
            return "Invalid Token."
        default:
            return "Unable to process request. The system encountered some technical problem. Sorry for the inconvenience.";
    }
}

export default ResponseMessage;
import { SignIn } from '@clerk/clerk-react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', minHeight: 'calc(100vh - 150px)' }}>
      <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '480px', background: 'transparent', boxShadow: 'none' }}>
        <SignIn 
          routing="path" 
          path="/login" 
          signUpUrl="/register" 
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: 'btn btn-primary',
              card: 'clerk-card-override'
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;
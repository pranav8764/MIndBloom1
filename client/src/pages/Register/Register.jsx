import { SignUp } from '@clerk/clerk-react';
import './Register.css';

const Register = () => {
  return (
    <div className="register-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', minHeight: 'calc(100vh - 150px)' }}>
      <div className="register-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '480px', background: 'transparent', boxShadow: 'none' }}>
        <SignUp 
          routing="path" 
          path="/register" 
          signInUrl="/login" 
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

export default Register;
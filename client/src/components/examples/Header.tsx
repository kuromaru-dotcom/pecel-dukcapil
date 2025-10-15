import Header from '../Header';

export default function HeaderExample() {
  return (
    <div>
      <Header 
        userRole="cs" 
        userName="Siti Aminah"
        onLogin={() => console.log('Login clicked')}
        onLogout={() => console.log('Logout clicked')}
      />
    </div>
  );
}

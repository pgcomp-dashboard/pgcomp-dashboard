import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import PersonInfo from './components/PersonInfo/PersonInfo';
import Session from './components/Session/Session';
import UserProductions from './components/UserProductions/UserProductions';
import {LoginPage} from './pages';
import DefaultPage from './pages/DefaultPage/DefaultPage';
import {AuthProvider} from './providers/AuthProvider';
import NotFoundPage from './pages/NotFound';
import Erro500 from './pages/Erro500';
import XmlUpload from './components/XmlUpload/XmlUpload';
import {BrowserRouter, Routes, Route} from 'react-router';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/admin' element={<DefaultPage/>}>
                            <Route path='areas' element={<Session/>}/>
                            <Route path='qualis' element={<Session/>}/>
                            <Route path='professors' element={<Session/>}/>
                            <Route path='professors/:id' element={<PersonInfo/>}/>
                            <Route path="professors/:id/productions" element={<UserProductions/>}/>
                            <Route path="professors/:id/xml-upload" element={<XmlUpload/>}/>
                            <Route path='students' element={<Session/>}/>
                            <Route path='students/:id' element={<PersonInfo/>}/>
                            <Route path="students/:id/productions" element={<UserProductions/>}/>
                            <Route path="students/:id/xml-upload" element={<XmlUpload/>}/>
                            <Route index element={null}/>
                        </Route>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="*" element={<NotFound/>}/>
                        <Route path="/erro" element={<Erro500/>}/>
                        <Route path="/" element={<Dashboard/>}/>
                        <Route path={'*'} element={<NotFoundPage/>}/>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

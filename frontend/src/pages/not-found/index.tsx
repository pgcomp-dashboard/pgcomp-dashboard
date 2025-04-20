import { NavLink }  from 'react-router';

export default function Index() {
    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-around">
            <h1 className="text-4xl font-bold p-2">Página não encontrada</h1>
            <div>
                <p className="pb-5 text-black/75 dark:text-white/75">Essa página não foi encontrada na nossa aplicação.</p>
                <NavLink to="/" className="p-2 underline">Voltar para o início</NavLink>
            </div>
            <div></div>
        </div>
    )
}
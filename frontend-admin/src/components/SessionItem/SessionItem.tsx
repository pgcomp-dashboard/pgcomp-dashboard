interface SessionItemProps {
    label: string;
    icon: any,
    session: string,
    setSelectedSession: any
}

function SessionItem({ label, icon, session, setSelectedSession }: SessionItemProps) {
    return (
        <li onClick={() => setSelectedSession(session)}>
            {icon}

            <span>
                {label}
            </span>
        </li>
    )
}

export default SessionItem
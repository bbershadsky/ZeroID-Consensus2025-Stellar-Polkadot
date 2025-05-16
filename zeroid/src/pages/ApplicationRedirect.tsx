import { useEffect } from "react";

interface Props {
    url: string;
}

const ApplicationRedirect = ({ url }: Props) => {
    useEffect(() => {
        window.location.href = url;
    }, [url]);

    return <p>Redirecting...</p>;
};

export default ApplicationRedirect;
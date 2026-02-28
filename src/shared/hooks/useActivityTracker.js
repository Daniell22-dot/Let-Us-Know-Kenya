import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const useActivityTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Log page view
        const logPageView = async () => {
            try {
                await api.logActivity('page_view', {
                    url: window.location.href,
                    path: location.pathname
                }, location.pathname);
            } catch (err) {
                // Silent fail for logging
            }
        };

        logPageView();
    }, [location]);

    useEffect(() => {
        const handleInteraction = async (e) => {
            const target = e.target;
            const actionType = e.type === 'click' ? 'click' : 'input';

            // Only log meaningful interactions (buttons, links, inputs)
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                try {
                    await api.logActivity(actionType, {
                        element: target.tagName,
                        text: target.innerText || target.placeholder || target.value || 'N/A',
                        id: target.id || 'N/A',
                        className: target.className || 'N/A'
                    }, window.location.pathname);
                } catch (err) {
                    // Silent fail
                }
            }
        };

        document.addEventListener('click', handleInteraction);
        // We could add more listeners here if needed

        return () => {
            document.removeEventListener('click', handleInteraction);
        };
    }, []);
};

export default useActivityTracker;

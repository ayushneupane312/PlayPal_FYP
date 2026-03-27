import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useKhaltiStore } from '../store/KhaltiStore';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { verifyPayment, isLoading, success, error, paymentDetails, paymentStatus, resetState } =
        useKhaltiStore();

    useEffect(() => {
        const handleCallback = async () => {
            const pidx             = searchParams.get('pidx');
            const callbackStatus   = searchParams.get('status');

            // User cancelled — skip lookup
            if (callbackStatus === 'User canceled') {
                useKhaltiStore.setState({
                    paymentStatus: 'User canceled',
                    isLoading: false,
                });
                return;
            }

            if (!pidx) {
                useKhaltiStore.setState({
                    error: 'Invalid callback. No payment ID found.',
                    isLoading: false,
                });
                return;
            }

            // Always verify via lookup — never trust callback alone
            try {
                await verifyPayment(pidx);
            } catch (err) {
                console.error('Verification error:', err);
            }
        };

        handleCallback();

        // Cleanup on unmount
        return () => resetState();
    }, [searchParams]);

    // ─── Verifying ────────────────────────────────────────────────────────────
    if (isLoading || (!paymentStatus && !error)) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2>Verifying your payment...</h2>
                    <p style={{ color: '#666' }}>Please do not close this page.</p>
                </div>
            </div>
        );
    }

    // ─── Success ──────────────────────────────────────────────────────────────
    if (success && paymentStatus === 'Completed') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={{ fontSize: '60px' }}>✅</div>
                    <h2 style={{ color: '#2e7d32' }}>Payment Successful!</h2>
                    <div style={styles.detailBox}>
                        <p><strong>Transaction ID:</strong> {paymentDetails?.transaction_id}</p>
                        <p><strong>Amount Paid:</strong> Rs. {paymentDetails?.amount_in_rupees}</p>
                        <p><strong>Order ID:</strong> {searchParams.get('purchase_order_id')}</p>
                    </div>
                    <button
                        style={{ ...styles.btn, backgroundColor: '#2e7d32' }}
                        onClick={() => navigate('/')}
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // ─── Failed / Cancelled ───────────────────────────────────────────────────
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={{ fontSize: '60px' }}>❌</div>
                <h2 style={{ color: '#c62828' }}>
                    {paymentStatus === 'User canceled' ? 'Payment Cancelled' : 'Payment Failed'}
                </h2>
                <p style={{ color: '#666' }}>
                    {paymentStatus === 'User canceled'
                        ? 'You cancelled the payment.'
                        : error || 'Payment was not completed. Please try again.'}
                </p>
                <button
                    style={{ ...styles.btn, backgroundColor: '#c62828' }}
                    onClick={() => navigate('/checkout')}
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '450px',
        width: '90%',
    },
    detailBox: {
        backgroundColor: '#f9f9f9',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'left',
        margin: '16px 0',
        lineHeight: '2',
    },
    btn: {
        color: 'white',
        padding: '12px 32px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '16px',
    },
};

export default PaymentCallback;
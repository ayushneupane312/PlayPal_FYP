import { useKhaltiStore } from '../store/KhaltiStore';

const KhaltiButton = ({ amount, orderId, orderName, customer }) => {
    const { initiatePayment, isLoading, error } = useKhaltiStore();

    const handlePayment = async () => {
        try {
            await initiatePayment({
                amount,
                purchase_order_id: `${orderId}-${Date.now()}`, // ✅ this line only
                purchase_order_name: orderName,
                customer_info: {
                    name: customer?.name || 'Customer',
                    email: customer?.email || 'customer@example.com',
                    phone: customer?.phone || '9800000001',
                },
            });
        } catch (err) {
            console.error('Payment error:', err);
        }
    };

    return (
        <div>
            {error && (
                <p style={{ color: 'red', marginBottom: '8px', fontSize: '14px' }}>
                    {error}
                </p>
            )}
            <button
                onClick={handlePayment}
                disabled={isLoading}
                style={{
                    backgroundColor: isLoading ? '#a78bc4' : '#5C2D91',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                {isLoading ? 'Redirecting...' : 'Pay with Khalti'}
            </button>
        </div>
    );
};

export default KhaltiButton;
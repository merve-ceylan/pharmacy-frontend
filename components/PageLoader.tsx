export default function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
                <p className="text-gray-500">Yükleniyor...</p>
            </div>
        </div>
    );
}
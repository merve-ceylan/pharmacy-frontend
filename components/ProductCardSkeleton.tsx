import Skeleton from './Skeleton';

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            {/* Resim */}
            <Skeleton variant="rectangular" height="160px" className="mb-4" />

            {/* Başlık */}
            <Skeleton variant="text" height="1.25rem" className="mb-2" />
            <Skeleton variant="text" width="60%" height="1rem" className="mb-4" />

            {/* Fiyat */}
            <div className="flex justify-between items-center">
                <Skeleton variant="text" width="80px" height="1.5rem" />
                <Skeleton variant="rectangular" width="100px" height="36px" />
            </div>
        </div>
    );
}
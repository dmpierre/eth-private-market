interface ListingsTableProps {
    listingsElements: JSX.Element[];
    isMounted: boolean;
    type: 'bids' | 'asks' | 'orders';
}

export const ListingsTable: React.FC<ListingsTableProps> = ({
    listingsElements,
    isMounted,
    type,
}) => {
    const title =
        type == 'bids' ? 'bidding' : type == 'orders' ? 'ordering' : 'asking';
    return isMounted ? (
        <div className="flex justify-center">
            <table className="border-4 rounded-md border-separate border-spacing-x-1 md:border-spacing-x-4 border-spacing-y-4 lg:border-spacing-x-12">
                <thead>
                    <tr className="text-center">
                        {type == 'orders' ? (
                            <>
                                <th className="font-mono md:text-base text-sm">
                                    id
                                </th>
                                <th className="font-mono md:text-base text-sm">
                                    ask
                                </th>
                                <th className="font-mono md:text-base text-sm">
                                    from
                                </th>
                                <th className="font-mono md:text-base text-sm">
                                    status
                                </th>
                            </>
                        ) : (
                            <>
                                <th className="font-mono md:text-base text-sm">
                                    type
                                </th>
                                <th className="font-mono md:text-base text-sm">
                                    {title}
                                </th>
                                <th className="font-mono md:text-base text-sm">
                                    status
                                </th>
                                <th className="font-mono md:text-base text-sm">
                                    price
                                </th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>{listingsElements}</tbody>
            </table>
        </div>
    ) : (
        <></>
    );
};

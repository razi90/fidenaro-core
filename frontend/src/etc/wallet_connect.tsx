function ConnectButton() {
    return (
        <div className="connectBtn" dangerouslySetInnerHTML={{ __html: '<radix-connect-button />' }} />

    );
}

export default ConnectButton;

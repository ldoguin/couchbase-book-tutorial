const appInit= require('./app')

const main = async() => {
    // Define your routes and API endpoints here
    const app = await appInit.appServer();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main();
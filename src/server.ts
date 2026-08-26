import app from './app.ts';

const PORT = process.env.PORT || 4000;

app.listen(4000, (err) => {
    err ? console.log(err) : console.log('Server is running on port 3000')
});

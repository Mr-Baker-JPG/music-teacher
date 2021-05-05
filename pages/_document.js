import Document, { Html, Head, Main, NextScript } from "next/document"
import NavBar from "../components/NavBar"

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <script
            src="https://kit.fontawesome.com/ef69927139.js"
            crossOrigin="anonymous"
          ></script>
        </Head>
        <body>
          <NavBar />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

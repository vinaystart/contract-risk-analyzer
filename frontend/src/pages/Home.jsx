import { useState } from "react"
import UploadContract from "../components/upload/UploadContract"

function Home() {

  const [file, setFile] = useState(null)

  return (

    <div>

      <h2>Upload Contract</h2>

      <UploadContract onUploadSuccess={setFile} />

    </div>

  )
}

export default Home
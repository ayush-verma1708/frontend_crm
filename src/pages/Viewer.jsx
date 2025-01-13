import React from 'react'
import './viewer.css'
import Menubar from '../components/Menubar'
import ViewerTable from '../components/ViewerTable'

const Viewer = () => {
  return (
    <div className='viewer-body'>
        <Menubar heading='Viewer' />
        <div className="viewer-content">
            <ViewerTable />
        </div>
    </div>
  )
}

export default Viewer
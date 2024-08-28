import { Modal } from 'antd';
import BIDSUSHI_TEXT from '../Common/Constant';
const leave = ({
    showDialog,
    setShowDialog,
    cancelNavigation,
    confirmNavigation
}) => {

    const showModal = () => {
        setShowDialog(true);
    };

    return (
        <>
            <Modal okText={BIDSUSHI_TEXT.Yes} cancelText={BIDSUSHI_TEXT.No}  title="Confirmation Message"  open={showDialog} onOk={confirmNavigation} onCancel={cancelNavigation}>
            {BIDSUSHI_TEXT.unsavedChangesPopupMessage} 
            <br/>
                <p className='confirmation-text'>
                {BIDSUSHI_TEXT.unselectStage1}
                </p>
            
                
            </Modal>
        </>
    );
};
export default leave;
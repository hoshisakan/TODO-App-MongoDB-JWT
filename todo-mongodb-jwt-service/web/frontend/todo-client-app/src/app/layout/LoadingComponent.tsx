import { StyledLoginPageOutsideDiv } from "./styles/LoadingPageOutsideStyledComponent";

interface Props {
    content?: string;
}

export default function LoadingComponent({ content = 'Loading...' }: Props) {
    return (
        <div className="modal-dialog modal-fullscreen">
            <StyledLoginPageOutsideDiv>
                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                &nbsp;
                <strong>{content}</strong>
            </StyledLoginPageOutsideDiv>
        </div>
    );
}

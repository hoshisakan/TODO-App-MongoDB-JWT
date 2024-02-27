import { Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';

/*
    DrapCard.tsx
*/
export const DragItem = styled.div`
    // user-select: none;
    // min-height: 50px;
    padding: 16px;
    font-size: 1em;
    text-align: center;
    // margin-bottom: 20px;
    position: relative;
    width: 300px;
    // width: auto;
`;
// export const DragItem = styled.div.attrs<{ isDragging: boolean; draggableStyle: any }>((props) => props)`
//     // user-select: none;
//     // min-height: 50px;
//     padding: 16px;
//     font-size: 1em;
//     text-align: center;
//     background-color: ${(p) => (p.isDragging ? 'green' : 'white')} !important
//     color: ${(p) => (p.isDragging ? 'red' : 'black')}; !important
//     // margin-bottom: 20px;
//     position: relative;
//     width: 300px;
//     // width: auto;
// `;

// export const TimeAvatar = styled.div`
//     width: 24px;
//     height: 24px;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     border-radius: 999px;
//     background-color: #e38b29;
//     color: black;
//     position: absolute;
//     right: 2%;
//     top: -20%;
// `;

export const DragItemHeader = styled.div`
    color: black;
    font-weight: bold;
    text-align: left;
    padding: 8px; // 在元素的邊框和內容之間添加空間
`;

export const DragItemContent = styled.div`
    border-radius: 25px;
    background-color: #808080;
    color: white;
    // height: auto;
    word-wrap: break-word; // 允許文字在單詞邊界換行
    overflow-wrap: break-word; // 若使用 word-wrap 後，詞彙仍舊會溢出容器元素 (如: div)，則允許文字在任何點換行，包括在單詞內部
    // max-width: 100%; // 限制寬度，防止超出 DragItem
`;

/*
    DroppableSectionWrapper.tsx
*/
export const OutsideSectionWrapper = styled.div`
    //display: flex;
    //align-items: center; // 這行會讓子元素在垂直方向上對齊
    flex-basis: 100%;
    // width: 300px;
    padding: 10px;

    @media (max-width: 768px) {
        padding: 10px;
        width: 100%;
    }
`;

export const StyledDroppable = styled(Droppable)`
    margin: 50px; // 在元素之間添加空間
    padding: 50px; // 在元素的邊框和內容之間添加空間
`;

export const DroppableContainer = styled.div`
    background-color: #f5efe6;
    // height: 100%;
    // height: auto;
    // width: 300px;
    // box-shadow: 20px 20px 50px white;
    // padding: 80px;
    border-radius: 25px;

    @media (max-width: 768px) {
        padding: 10px;
    }
`;

/*
    TodoDashboard.tsx
*/
export const DropContextWrapper = styled.div`
    font-family: sans-serif;
    display: flex;
    align-items: stretch;
    justify-content: center;
    // gap: 10px;
    // min-height: 500px;
    // min-height: auto;
    padding: auto;
`;

export const StyledDashboardWrapper = styled.div`
    display: flex; // 將 div 的物件排在同一列
    // flex-direction: row-reverse; // 將 div 的物件由右至左排序
    flex-wrap: wrap; // 若元件排列後，超出外容器主軸，則允許其換行
    // justify-content: center;
    // align-content: center;
    margin-top: 80px; /* 與 header 的距離 */
    margin-bottom: 25px; /* 與 footer 的距離 */
    // flex-wrap: nowrap; // 防止 flex 項目換行
    // overflow-x: auto; // 當內容超出寬度時顯示水平滾輪
    overflow: visible; // 當內容超出寬度時顯示水平與垂直滾輪
    // width: 100%;
    // height: 100%;

    @media (max-width: 768px) {
        width: 100%; // 在小於 600px 的視窗上，物件的寬度為 100%
        // height: 100%; // 在小於 600px 的視窗上，物件的高度為 100%
    }
`;

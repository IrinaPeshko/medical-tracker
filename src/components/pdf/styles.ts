import { StyleSheet, Font } from '@react-pdf/renderer';
import RobotoRegular from '../../assets/fonts/Roboto-Regular.ttf';
import RobotoItalic from '../../assets/fonts/Roboto-Italic.ttf';
import RobotoBold from '../../assets/fonts/Roboto-Bold.ttf';
import RobotoBoldItalic from '../../assets/fonts/Roboto-BoldItalic.ttf';

// Регистрируем шрифт для поддержки русского языка
Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal', fontStyle: 'normal' },
    { src: RobotoItalic, fontWeight: 'normal', fontStyle: 'italic' },
    { src: RobotoBold, fontWeight: 'bold', fontStyle: 'normal' },
    { src: RobotoBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

export const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 12,
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1976d2',
  },
  subtitle: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    color: '#333333',
    borderBottom: '1px solid #cccccc',
    paddingBottom: 3,
  },
  text: {
    fontFamily: 'Roboto',
    fontSize: 11,
    marginBottom: 4,
    color: '#333333',
  },
  boldText: {
    fontFamily: 'Roboto',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333333',
  },
  smallText: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  metadata: {
    fontFamily: 'Roboto',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 15,
    border: '1px solid #dddddd',
  },
  table: {
    fontFamily: 'Roboto',
    // display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 15,
  },
  tableRow: {
    fontFamily: 'Roboto',
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    fontFamily: 'Roboto',
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
  },
  tableColWide: {
    fontFamily: 'Roboto',
    width: '40%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
  },
  tableColNarrow: {
    fontFamily: 'Roboto',
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 5,
  },
  tableCell: {
    fontFamily: 'Roboto',
    fontSize: 9,
    textAlign: 'left',
  },
  tableCellHeader: {
    fontFamily: 'Roboto',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalStatus: {
    fontFamily: 'Roboto',
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  abnormalStatus: {
    fontFamily: 'Roboto',
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  warningStatus: {
    fontFamily: 'Roboto',
    color: '#f57c00',
    fontWeight: 'bold',
  },
  parameterHeader: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#1976d2',
  },
  trendText: {
    fontFamily: 'Roboto',
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 3,
  },
  pageNumber: {
    fontFamily: 'Roboto',
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666666',
  },
  statsGrid: {
    fontFamily: 'Roboto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    fontFamily: 'Roboto',
    width: '23%',
    backgroundColor: '#f8f9fa',
    padding: 8,
    textAlign: 'center',
    border: '1px solid #dee2e6',
  },
  statNumber: {
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
  },
});

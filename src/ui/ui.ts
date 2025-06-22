import styled from '@emotion/styled';

export const ToggleButton = styled.button`
  width: 80px;
`;

export const ChartContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

export const ChartWrapper = styled.div`
  width: 100%;
  background-color: var(--background);
  border: 1px solid var(--foreground);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const ChartTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--foreground);
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

export const AllChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
`;

export const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const SectionTitle = styled.h2`
  color: var(--foreground);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0 1rem;
  border-left: 4px solid var(--foreground);
`;

export const InvestorChartContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
`;

export const ChartLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--foreground);
  font-size: 1.1rem;
  font-weight: 500;
`;

export const ChartIndicator = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

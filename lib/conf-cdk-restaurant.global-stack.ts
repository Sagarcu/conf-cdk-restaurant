import { Construct } from 'constructs';
import {HostedZone} from "aws-cdk-lib/aws-route53";
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import {Stack, StackProps} from "aws-cdk-lib";
import {subdomain} from '../settings';

export class ConfCdkRestaurantGlobalStack extends Stack {
  public confCdkRestaurantDistributionCertificate: Certificate;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'cloud101HostedZone', {
      domainName: 'cloud101.nl'
    });

    this.confCdkRestaurantDistributionCertificate = new Certificate(this, subdomain + '.cloud101-certificate', {
      domainName: subdomain + '.cloud101.nl',
      certificateName: subdomain + '.cloud101-certificate',
      validation: CertificateValidation.fromDns(hostedZone),
    });
  }
}
